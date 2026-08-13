const config = require('../config');
const { chatCompletion } = require('./openaiClient');
const Score = require('../models/Score');
const AuditLog = require('../models/AuditLog');
const PromptVersion = require('../models/PromptVersion');

/**
 * AI Scoring Service — Shadow Mode
 *
 * Scores a completed test session using an LLM (or mock) and writes
 * the result to the Score collection + AuditLog.
 *
 * This service is designed to be called fire-and-forget from the controller.
 * It MUST NOT throw unhandled errors — all failures are caught and logged.
 */

/**
 * Main entry point: Score a test session with AI.
 *
 * @param {Object} session - The completed TestSession (with populated questions and responses)
 * @param {string} schoolId - The school's ObjectId string
 */
async function scoreTestSession(session, schoolId) {
  const startTime = Date.now();

  try {
    // 1. Get the active scoring prompt for this school
    const promptVersion = await getActiveScoringPrompt(schoolId);
    if (!promptVersion) {
      console.warn('[AI Scoring] No active scoring prompt found for school', schoolId);
      await logAuditEvent(schoolId, session._id, session.student_id, 'ai_scoring_skipped', {
        reason: 'no_active_prompt',
      });
      return;
    }

    // 2. Build the prompt with question data
    const questionsData = buildQuestionsPayload(session);
    const messages = buildScoringMessages(promptVersion.prompt_text, questionsData);

    // 3. Call the LLM
    const response = await chatCompletion(messages);

    // 4. Parse the response
    const parsed = parseAiResponse(response.content, session);

    // 5. Calculate overall confidence
    const confidences = parsed.evaluations
      .map(e => e.confidence)
      .filter(c => c != null);
    const overallConfidence = confidences.length > 0
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : null;

    // 6. Build question_scores array
    const questionScores = session.questions.map((q, idx) => {
      const evaluation = parsed.evaluations.find(e => e.question_index === idx);
      return {
        question_id: q._id,
        awarded: evaluation?.is_correct ? 1 : 0,
        max: 1,
        confidence: evaluation?.confidence ?? null,
      };
    });

    const totalScore = questionScores.reduce((sum, qs) => sum + qs.awarded, 0);
    const maxScore = questionScores.reduce((sum, qs) => sum + qs.max, 0);

    // 7. Determine if this needs human review
    const flaggedForReview = overallConfidence !== null &&
      overallConfidence < config.ai.confidenceThreshold;

    // 8. Write Score document
    const scoreDoc = await Score.create([{
      school_id: schoolId,
      session_id: session._id,
      student_id: session.student_id,
      question_scores: questionScores,
      total_score: totalScore,
      max_score: maxScore,
      overall_confidence: overallConfidence,
      scorer_type: config.ai.isMockMode ? 'ai' : 'ai', // Both are 'ai' type — mock is still AI pipeline
      prompt_version_id: promptVersion._id,
      model_metadata: {
        ...response.metadata,
        mock_mode: config.ai.isMockMode,
        pipeline_latency_ms: Date.now() - startTime,
      },
      flagged_for_review: flaggedForReview,
    }], { bypassScope: true });

    // 9. Write AuditLog entry
    await logAuditEvent(schoolId, session._id, session.student_id, 'ai_scored', {
      score_id: scoreDoc[0]._id,
      total_score: totalScore,
      max_score: maxScore,
      overall_confidence: overallConfidence,
      flagged_for_review: flaggedForReview,
      scorer_type: config.ai.isMockMode ? 'mock_ai' : 'live_ai',
      model: response.metadata.model,
      latency_ms: response.metadata.latency_ms,
    });

    console.log(
      `[AI Scoring] ${config.ai.isMockMode ? '(MOCK)' : ''} Session ${session._id}: ` +
      `Score ${totalScore}/${maxScore}, Confidence ${overallConfidence?.toFixed(2) ?? 'N/A'}, ` +
      `Flagged: ${flaggedForReview}`
    );

    // Return the result so the controller can use it as the primary score
    return { total_score: totalScore, max_score: maxScore, overall_confidence: overallConfidence };

  } catch (error) {
    // CRITICAL: Never let AI scoring crash the request.
    // Log the failure and move on.
    console.error('[AI Scoring] FAILED for session', session._id, ':', error.message);

    try {
      await logAuditEvent(schoolId, session._id, session.student_id, 'ai_scoring_failed', {
        error: error.message,
        stack: error.stack?.substring(0, 500),
      });
    } catch (auditError) {
      console.error('[AI Scoring] Failed to write failure audit log:', auditError.message);
    }
  }
}

/**
 * Fetch the active scoring prompt for a school.
 */
async function getActiveScoringPrompt(schoolId) {
  return PromptVersion.findOne({
    purpose: 'scoring',
    is_active: true,
  }).setOptions({ schoolId });
}

/**
 * Build the questions payload for the LLM prompt.
 * Extracts question text, options, correct answer, and student's response.
 */
function buildQuestionsPayload(session) {
  return session.questions.map((q, idx) => {
    const studentResponse = session.responses?.get(q._id.toString());
    const studentAnswer = studentResponse != null ? q.options[studentResponse] : 'No answer';
    const correctAnswer = q.options[q.correct_option_index];
    const studentIsCorrect = studentResponse === q.correct_option_index;

    return {
      question_index: idx,
      question_text: q.text,
      options: q.options,
      correct_answer: correctAnswer,
      student_answer: studentAnswer,
      student_is_correct: studentIsCorrect,
      format: q.format || 'MCQ',
    };
  });
}

/**
 * Build the chat messages array for the LLM call.
 */
function buildScoringMessages(promptTemplate, questionsData) {
  const userContent = `Please evaluate the following student test responses:\n\n` +
    '```json\n' +
    JSON.stringify(questionsData, null, 2) +
    '\n```\n\n' +
    'Return your evaluation as a JSON object with an "evaluations" array.';

  return [
    { role: 'system', content: promptTemplate },
    { role: 'user', content: userContent },
  ];
}

/**
 * Parse the AI response JSON.
 * Returns a normalized structure with evaluations array.
 */
function parseAiResponse(content, session) {
  try {
    const parsed = JSON.parse(content);

    if (!parsed.evaluations || !Array.isArray(parsed.evaluations)) {
      console.warn('[AI Scoring] Response missing evaluations array, using empty');
      return { evaluations: [] };
    }

    return parsed;
  } catch (error) {
    console.warn('[AI Scoring] Failed to parse AI response JSON:', error.message);
    return { evaluations: [] };
  }
}

/**
 * Helper: Write an AuditLog entry.
 */
async function logAuditEvent(schoolId, entityId, actorId, action, meta) {
  try {
    await AuditLog.create([{
      school_id: schoolId,
      entity: 'TestSession',
      entity_id: entityId,
      action,
      actor_id: actorId,
      actor_role: 'System',
      meta,
    }], { bypassScope: true });
  } catch (error) {
    console.error('[AuditLog] Write failed:', error.message);
  }
}

module.exports = { scoreTestSession };
