const { ApiError } = require('../middleware/errorHandler');
const Score = require('../models/Score');
const TestSession = require('../models/TestSession');
const AuditLog = require('../models/AuditLog');

/**
 * Fetch all flagged scores that need review.
 * GET /api/scores/flagged
 * Access: Admin, Teacher, Counselor
 */
exports.getFlaggedScores = async (req, res, next) => {
  try {
    const schoolId = req.schoolId;

    const flaggedScores = await Score.find({
      flagged_for_review: true,
    })
    .populate({
      path: 'session_id',
      populate: {
        path: 'questions',
        options: { schoolId }
      },
      options: { schoolId }
    })
    .populate({
      path: 'student_id',
      select: 'name roll_no grade section',
      options: { schoolId }
    })
    .sort({ created_at: -1 })
    .setOptions({ schoolId });

    res.status(200).json({
      success: true,
      data: flaggedScores,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve a flagged score (Human override).
 * PUT /api/scores/:id/review
 * Access: Admin, Teacher, Counselor
 */
exports.resolveFlaggedScore = async (req, res, next) => {
  try {
    const scoreId = req.params.id;
    const { total_score, question_scores, review_notes } = req.body;
    const schoolId = req.schoolId;

    if (total_score == null) {
      throw new ApiError(400, 'total_score is required');
    }

    const scoreDoc = await Score.findById(scoreId).setOptions({ schoolId });
    if (!scoreDoc) {
      throw new ApiError(404, 'Score document not found');
    }
    if (!scoreDoc.flagged_for_review) {
      throw new ApiError(400, 'Score is not flagged for review');
    }

    const oldTotalScore = scoreDoc.total_score;

    // 1. Update Score document
    scoreDoc.total_score = total_score;
    if (question_scores) {
      scoreDoc.question_scores = question_scores;
    }
    scoreDoc.flagged_for_review = false;
    scoreDoc.reviewed_by = req.user.user_id; // staff member's ID
    scoreDoc.reviewed_at = new Date();
    scoreDoc.scorer_type = 'human_override';
    scoreDoc.review_notes = review_notes || '';

    await scoreDoc.save();

    // 2. Update TestSession document
    const session = await TestSession.findById(scoreDoc.session_id).setOptions({ schoolId });
    if (session) {
      session.score = total_score;
      await session.save();
    }

    // 3. Log to AuditLog
    await AuditLog.create([{
      school_id: schoolId,
      entity: 'Score',
      entity_id: scoreDoc._id,
      action: 'human_override',
      actor_id: req.user.user_id,
      actor_role: req.user.role,
      meta: {
        old_total_score: oldTotalScore,
        new_total_score: total_score,
        review_notes: review_notes,
      }
    }], { bypassScope: true });

    res.status(200).json({
      success: true,
      message: 'Score reviewed and updated.',
      data: scoreDoc,
    });
  } catch (error) {
    next(error);
  }
};
