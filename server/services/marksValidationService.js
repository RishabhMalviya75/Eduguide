const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Service to parse and validate CSV marks data.
 * Does not interact with the database directly.
 */
class MarksValidationService {
  
  /**
   * Parses a CSV buffer into an array of JSON objects.
   * Expected columns: Roll Number, Subject, Marks Obtained, Maximum Marks, Exam Name
   */
  parseCSVBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_'),
          mapValues: ({ value }) => value.trim()
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Validates parsed CSV rows against business rules.
   * @param {Array} rows - Parsed CSV rows
   * @param {Array} studentsInClass - Array of student documents belonging to the teacher's class
   * @returns {Object} { validRecords: [], flaggedRecords: [] }
   */
  validateRows(rows, studentsInClass) {
    const validRecords = [];
    const flaggedRecords = [];

    // Create a lookup map for faster student matching (roll_no -> student_id)
    const studentMap = new Map();
    studentsInClass.forEach(student => {
      studentMap.set(student.roll_no, student._id);
    });

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +1 for 0-index, +1 for header row
      let isValid = true;
      const errors = [];

      // Extract mapped headers
      const rollNo = row['roll_number'] || row['roll_no'];
      const subject = row['subject'];
      const marksObtainedRaw = row['marks_obtained'] || row['marks'];
      const maxMarksRaw = row['maximum_marks'] || row['max_marks'];
      const examName = row['exam_name'] || row['exam'];

      // Basic presence checks
      if (!rollNo) errors.push('Missing Roll Number');
      if (!subject) errors.push('Missing Subject');
      if (!marksObtainedRaw) errors.push('Missing Marks Obtained');
      if (!maxMarksRaw) errors.push('Missing Maximum Marks');
      if (!examName) errors.push('Missing Exam Name');

      const marksObtained = parseFloat(marksObtainedRaw);
      const maxMarks = parseFloat(maxMarksRaw);

      // Data type and bounds checks
      if (isNaN(marksObtained)) errors.push('Marks Obtained must be a number');
      else if (marksObtained < 0) errors.push('Marks Obtained cannot be negative');

      if (isNaN(maxMarks)) errors.push('Maximum Marks must be a number');
      else if (maxMarks <= 0) errors.push('Maximum Marks must be greater than 0');

      if (!isNaN(marksObtained) && !isNaN(maxMarks) && marksObtained > maxMarks) {
        errors.push(`Marks Obtained (${marksObtained}) exceeds Maximum Marks (${maxMarks})`);
      }

      // Student existence check
      let studentId = null;
      if (rollNo && !studentMap.has(rollNo)) {
        errors.push(`Student with Roll Number '${rollNo}' not found in your assigned classes`);
      } else if (rollNo) {
        studentId = studentMap.get(rollNo);
      }

      const record = {
        row: rowNumber,
        roll_no: rollNo,
        student_id: studentId,
        subject: subject,
        marks_obtained: marksObtainedRaw,
        max_marks: maxMarksRaw,
        exam_name: examName,
      };

      if (errors.length > 0) {
        flaggedRecords.push({ ...record, errors });
      } else {
        // Cast to numbers for valid records
        record.marks_obtained = marksObtained;
        record.max_marks = maxMarks;
        validRecords.push(record);
      }
    });

    return { validRecords, flaggedRecords };
  }
}

module.exports = new MarksValidationService();
