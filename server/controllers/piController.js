const { ApiError } = require('../middleware/errorHandler');
const PISession = require('../models/PISession');
const CareerInterestResult = require('../models/CareerInterestResult');
const Student = require('../models/Student');

/**
 * Log a new PI Session.
 * POST /api/pi
 * Access: Counselor, Admin
 */
exports.createPISession = async (req, res, next) => {
  try {
    const schoolId = req.schoolId;
    const counselorId = req.user.user_id;
    const { student_id, rubric_ratings, summary_tags, counselor_notes } = req.body;

    if (!student_id || !rubric_ratings) {
      throw new ApiError(400, 'Student ID and rubric ratings are required.');
    }

    // Verify student exists and belongs to school
    const student = await Student.findById(student_id).setOptions({ schoolId });
    if (!student) {
      throw new ApiError(404, 'Student not found.');
    }

    // 1. Create PI Session
    const newSession = await PISession.create([{
      school_id: schoolId,
      student_id,
      counselor_id: counselorId,
      rubric_ratings,
      summary_tags,
      counselor_notes
    }], { bypassScope: true });
    
    const piSession = newSession[0];

    // 2. Generate CareerInterestResult (Simple mapping logic for MVP)
    const suggestions = generateSuggestions(rubric_ratings, summary_tags);

    const newResult = await CareerInterestResult.create([{
      school_id: schoolId,
      student_id,
      mapped_from: 'pi_session',
      source_id: piSession._id,
      suggestions,
    }], { bypassScope: true });

    res.status(201).json({
      success: true,
      message: 'PI Session logged successfully.',
      data: {
        pi_session: piSession,
        career_interest: newResult[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Fetch PI history for a student.
 * GET /api/pi/student/:studentId
 * Access: Counselor, Admin, Teacher
 */
exports.getStudentPIHistory = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const schoolId = req.schoolId;

    const history = await PISession.find({ student_id: studentId })
      .populate({ path: 'counselor_id', select: 'name', options: { schoolId }})
      .sort({ date: -1 })
      .setOptions({ schoolId });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch Career Interest Result for a student.
 * GET /api/pi/student/:studentId/interest
 */
exports.getStudentCareerInterest = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const schoolId = req.schoolId;

    const result = await CareerInterestResult.findOne({ student_id: studentId })
      .sort({ generated_at: -1 })
      .setOptions({ schoolId });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Generate suggestions based on rubric ratings and tags.
 */
function generateSuggestions(rubric, tags) {
  const suggestions = new Set();

  if (rubric.communication >= 4 && rubric.leadership >= 4) {
    suggestions.add('Business Management');
    suggestions.add('Public Relations');
  }
  if (rubric.problem_solving >= 4 && rubric.creativity >= 4) {
    suggestions.add('Software Engineering');
    suggestions.add('Product Design');
  }
  if (rubric.creativity >= 4 && rubric.communication >= 4) {
    suggestions.add('Marketing');
    suggestions.add('Media & Journalism');
  }
  if (rubric.problem_solving >= 4 && rubric.leadership < 4) {
    suggestions.add('Data Science');
    suggestions.add('Research');
  }

  // Factor in tags
  if (tags.includes('Coding') || tags.includes('Robotics')) {
    suggestions.add('Software Engineering');
  }
  if (tags.includes('Debate') || tags.includes('Model UN')) {
    suggestions.add('Law');
    suggestions.add('Public Policy');
  }
  if (tags.includes('Art') || tags.includes('Design')) {
    suggestions.add('Graphic Design');
  }

  // Fallback
  if (suggestions.size === 0) {
    suggestions.add('General Studies');
  }

  return Array.from(suggestions).slice(0, 3); // Max 3 suggestions
}
