const { ApiError } = require('../middleware/errorHandler');
const Question = require('../models/Question');
const TestSession = require('../models/TestSession');

/**
 * Start a new test session for a student.
 * Pulls a random pool of questions and initializes the session.
 */
exports.startTest = async (req, res, next) => {
  try {
    const studentId = req.user.student_id;
    const schoolId = req.schoolId;

    // 1. Check if there's already an active test
    let activeSession = await TestSession.findOne({
      student_id: studentId,
      status: 'in_progress',
    })
    .populate({
      path: 'questions',
      select: '-correct_option_index -createdAt -updatedAt -__v',
      options: { schoolId }
    })
    .setOptions({ schoolId });

    if (activeSession) {
      return res.status(200).json({
        success: true,
        message: 'Resuming active test session.',
        data: activeSession,
      });
    }

    // 2. No active session. Fetch a random pool of 10 questions using MongoDB $sample
    // Note: $sample doesn't respect Mongoose middleware automatically, so we must add school_id filter manually.
    const mongoose = require('mongoose');
    const rawQuestions = await Question.aggregate([
      { $match: { school_id: new mongoose.Types.ObjectId(schoolId), is_active: true } },
      { $sample: { size: 10 } }
    ]);

    if (rawQuestions.length === 0) {
      throw new ApiError(404, 'No active questions found in the question bank.');
    }

    const questionIds = rawQuestions.map(q => q._id);

    // 3. Create the TestSession
    const newSession = await TestSession.create([{
      student_id: studentId,
      school_id: schoolId,
      status: 'in_progress',
      questions: questionIds,
      max_score: questionIds.length,
    }], { bypassScope: true }); // We pass an array of docs to create(), and use bypassScope to let it save, though the plugin should handle it

    // Create() returns an array if we pass an array, so grab the first one
    const createdSession = newSession[0];

    // 4. Fetch the populated questions to return (stripping answers)
    const populatedSession = await TestSession.findById(createdSession._id)
      .populate({
        path: 'questions',
        select: '-correct_option_index -createdAt -updatedAt -__v',
        options: { schoolId }
      })
      .setOptions({ schoolId });

    res.status(201).json({
      success: true,
      message: 'New test session started.',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit test responses and calculate score.
 */
exports.submitTest = async (req, res, next) => {
  try {
    const { sessionId, responses } = req.body;
    const schoolId = req.schoolId;

    if (!sessionId || !responses) {
      throw new ApiError(400, 'Session ID and responses are required.');
    }

    // 1. Find the active session
    const session = await TestSession.findOne({
      _id: sessionId,
      student_id: req.user.student_id,
      status: 'in_progress'
    })
    .populate({
      path: 'questions',
      options: { schoolId }
    })
    .setOptions({ schoolId });

    if (!session) {
      throw new ApiError(404, 'Active test session not found or already completed.');
    }

    // 2. Calculate score
    let score = 0;
    const responseMap = new Map(Object.entries(responses)); // Format: { "questionIdString": selectedIndexNumber }

    session.questions.forEach(question => {
      const qId = question._id.toString();
      if (responseMap.has(qId)) {
        const selectedOption = responseMap.get(qId);
        if (selectedOption === question.correct_option_index) {
          score += 1;
        }
      }
    });

    // 3. Save results
    session.status = 'completed';
    session.completed_at = new Date();
    session.responses = responses; // Mongoose will convert this object to a Map
    session.score = score;
    session.max_score = session.questions.length;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully.',
      data: {
        score: session.score,
        max_score: session.max_score,
        completed_at: session.completed_at,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get history of completed tests for the student.
 */
exports.getTestHistory = async (req, res, next) => {
  try {
    const history = await TestSession.find({
      student_id: req.user.student_id,
      status: 'completed'
    })
    .sort({ completed_at: -1 })
    .select('-responses -questions') // Keep it lightweight
    .setOptions({ schoolId: req.schoolId });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
