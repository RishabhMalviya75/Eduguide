const { ApiError } = require('../middleware/errorHandler');
const Question = require('../models/Question');
const TestSession = require('../models/TestSession');
const AuditLog = require('../models/AuditLog');
const { scoreTestSession } = require('../services/aiScoringService');

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

    // Capture starting IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    populatedSession.integrity_flags = {
      ip_log: [clientIp],
      focus_loss_count: 0,
      auto_flagged: false,
      flag_reasons: []
    };
    await populatedSession.save();

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
    const { session_id, sessionId, responses, proctoring_signals } = req.body;
    const finalSessionId = session_id || sessionId;
    const schoolId = req.schoolId;

    if (!finalSessionId || !responses) {
      throw new ApiError(400, 'Session ID and responses are required.');
    }

    // 1. Find the active session
    const session = await TestSession.findOne({
      _id: finalSessionId,
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

    // Proctoring Evaluation
    const submitIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const startIp = session.integrity_flags.ip_log[0];
    
    if (submitIp !== startIp && submitIp !== 'unknown') {
      session.integrity_flags.ip_log.push(submitIp);
      session.integrity_flags.auto_flagged = true;
      session.integrity_flags.flag_reasons.push('ip_mismatch');
    }

    if (proctoring_signals) {
      const focusLoss = proctoring_signals.focus_loss_count || 0;
      session.integrity_flags.focus_loss_count = focusLoss;
      
      if (focusLoss > 3) {
        session.integrity_flags.auto_flagged = true;
        session.integrity_flags.flag_reasons.push('excessive_focus_loss');
      }
    }

    // 2. Save responses and mark as completed
    session.status = 'completed';
    session.completed_at = new Date();
    session.responses = responses;
    session.max_score = session.questions.length;

    // 3. AI-based scoring (primary)
    //    Falls back to rule-based if AI pipeline fails.
    let finalScore;
    try {
      const aiResult = await scoreTestSession(session, schoolId);
      if (aiResult && aiResult.total_score != null) {
        finalScore = aiResult.total_score;
        console.log(`[Scoring] AI score used: ${finalScore}/${session.max_score}`);
      } else {
        // AI returned but no usable score — fall back
        finalScore = ruleFallback(session);
        console.warn('[Scoring] AI returned no score, fell back to rule-based');
      }
    } catch (err) {
      // AI failed entirely — graceful degradation to rule-based
      console.error('[Scoring] AI failed, falling back to rule-based:', err.message);
      finalScore = ruleFallback(session);
    }

    session.score = finalScore;
    await session.save();

    // Audit Logging for auto-flagged attempts
    if (session.integrity_flags.auto_flagged) {
      await AuditLog.create([{
        school_id: schoolId,
        entity: 'TestSession',
        entity_id: session._id,
        action: 'proctoring_auto_flag',
        actor_id: req.user.student_id, // System/Student
        meta: {
          flag_reasons: session.integrity_flags.flag_reasons,
          focus_loss_count: session.integrity_flags.focus_loss_count,
        }
      }], { bypassScope: true });
    }

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
 * Rule-based fallback scorer — used only if the AI pipeline fails.
 */
function ruleFallback(session) {
  let score = 0;
  session.questions.forEach(question => {
    const qId = question._id.toString();
    const studentResponse = session.responses?.get(qId);
    if (studentResponse != null && studentResponse === question.correct_option_index) {
      score += 1;
    }
  });
  return score;
}

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
