const Mark = require('../models/Mark');
const Student = require('../models/Student');
const marksValidationService = require('../services/marksValidationService');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Handle CSV Upload and return a preview of valid/flagged data.
 * Does NOT save to the database.
 */
exports.uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    if (req.user.role !== 'Teacher') {
      throw new ApiError(403, 'Only teachers can upload marks');
    }

    // 1. Parse CSV
    const rows = await marksValidationService.parseCSVBuffer(req.file.buffer);
    
    if (rows.length === 0) {
      throw new ApiError(400, 'CSV file is empty or formatted incorrectly');
    }

    // 2. Fetch all students in the teacher's assigned classes
    // We fetch the teacher from the database to get the latest assigned classes
    const User = require('../models/User');
    const teacher = await User.findById(req.user.user_id).select('assigned_classes').setOptions({ schoolId: req.user.school_id });
    
    if (!teacher) {
      throw new ApiError(404, 'Teacher profile not found');
    }

    const teacherClasses = teacher.assigned_classes || [];
    
    // Construct an OR query for all assigned classes
    const classQueries = teacherClasses.map(c => ({
      grade: c.grade,
      section: c.section
    }));

    if (classQueries.length === 0) {
      throw new ApiError(400, 'You are not assigned to any classes');
    }

    // Fetch students that match any of the teacher's assigned classes
    const studentsInClass = await Student.find({ $or: classQueries })
      .setOptions({ schoolId: req.user.school_id });

    // 3. Validate rows
    const { validRecords, flaggedRecords } = marksValidationService.validateRows(rows, studentsInClass);

    res.status(200).json({
      success: true,
      data: {
        total_rows: rows.length,
        valid_count: validRecords.length,
        flagged_count: flaggedRecords.length,
        valid_records: validRecords,
        flagged_records: flaggedRecords,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept corrected/validated data from the frontend and save to the database.
 */
exports.confirmUpload = async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      throw new ApiError(400, 'No records provided for upload');
    }

    if (req.user.role !== 'Teacher') {
      throw new ApiError(403, 'Only teachers can upload marks');
    }

    // Prepare documents for bulk insert
    const documents = records.map(record => ({
      student_id: record.student_id,
      school_id: req.user.school_id, // Ensure tenant isolation
      teacher_id: req.user._id,
      subject: record.subject,
      marks_obtained: Number(record.marks_obtained),
      max_marks: Number(record.max_marks),
      exam_name: record.exam_name,
    }));

    // We use insertMany with ordered: false so if some fail (e.g. unique constraint), 
    // others still succeed, or we can handle it gracefully.
    try {
      const result = await Mark.insertMany(documents, { ordered: false });
      
      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${result.length} marks`,
        data: {
          inserted_count: result.length
        }
      });
    } catch (insertError) {
      // Handle BulkWriteError (e.g., duplicate key errors from our compound index)
      if (insertError.code === 11000) {
        throw new ApiError(400, `Some records were skipped because marks for that student, subject, and exam already exist. ${insertError.insertedDocs ? insertError.insertedDocs.length : 0} records were saved.`);
      }
      throw insertError;
    }
  } catch (error) {
    next(error);
  }
};
