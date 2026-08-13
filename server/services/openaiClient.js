const config = require('../config');

/**
 * OpenAI Client — thin wrapper around the OpenAI API.
 *
 * Automatically falls back to mock mode when no API key is configured.
 * Mock mode simulates AI responses locally for development/testing.
 */

let openaiInstance = null;

function getClient() {
  if (config.ai.isMockMode) return null;

  if (!openaiInstance) {
    const OpenAI = require('openai');
    openaiInstance = new OpenAI({ apiKey: config.ai.openaiApiKey });
  }
  return openaiInstance;
}

/**
 * Call the LLM with the given messages.
 *
 * @param {Array} messages - Array of { role, content } message objects
 * @param {Object} opts - Optional overrides: { model, temperature, max_tokens }
 * @returns {{ content: string, metadata: { model, latency_ms, prompt_tokens, completion_tokens } }}
 */
async function chatCompletion(messages, opts = {}) {
  const model = opts.model || config.ai.model;
  const temperature = opts.temperature ?? 0; // Deterministic by default for scoring
  const max_tokens = opts.max_tokens || 2000;

  // ── Mock Mode ────────────────────────────────────────────────
  if (config.ai.isMockMode) {
    return mockCompletion(messages, { model, temperature, max_tokens });
  }

  // ── Real API Call ────────────────────────────────────────────
  const client = getClient();
  const startTime = Date.now();

  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        response_format: { type: 'json_object' },
      });

      const latency_ms = Date.now() - startTime;
      const choice = response.choices[0];

      return {
        content: choice.message.content,
        metadata: {
          model: response.model,
          latency_ms,
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      lastError = error;
      // Retry on transient errors (rate limit, server error)
      if (attempt < maxRetries && (error.status === 429 || error.status >= 500)) {
        const backoff = attempt * 1000;
        console.warn(`[AI] Attempt ${attempt} failed (${error.status}), retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

/**
 * Mock completion — simulates an AI response for development without API costs.
 *
 * It parses the user message to extract question data, then produces
 * a deterministic "AI agrees with rule-based" response with randomized confidence.
 */
function mockCompletion(messages, opts) {
  const startTime = Date.now();

  // Extract the user message which contains the question data
  const userMsg = messages.find(m => m.role === 'user');
  if (!userMsg) {
    return {
      content: JSON.stringify({ evaluations: [] }),
      metadata: { model: 'mock-' + opts.model, latency_ms: 5, prompt_tokens: 0, completion_tokens: 0 },
    };
  }

  // Try to parse the embedded question data from the prompt
  let evaluations = [];
  try {
    // The prompt format includes a JSON block with questions
    const jsonMatch = userMsg.content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const questionsData = JSON.parse(jsonMatch[1]);
      evaluations = questionsData.map((q, idx) => {
        // Mock: agree with whatever the student picked being correct/incorrect
        // with a slightly randomized confidence
        const baseConfidence = 0.75 + (Math.random() * 0.2); // 0.75–0.95
        return {
          question_index: idx,
          is_correct: q.student_is_correct,
          confidence: parseFloat(baseConfidence.toFixed(2)),
          reasoning: `Mock evaluation: Student ${q.student_is_correct ? 'correctly' : 'incorrectly'} answered "${q.question_text.substring(0, 50)}..."`,
        };
      });
    }
  } catch {
    // If parsing fails, return empty evaluations
  }

  const latency_ms = Date.now() - startTime;
  return {
    content: JSON.stringify({ evaluations }),
    metadata: {
      model: 'mock-' + opts.model,
      latency_ms,
      prompt_tokens: Math.floor(userMsg.content.length / 4),
      completion_tokens: Math.floor(JSON.stringify({ evaluations }).length / 4),
    },
  };
}

module.exports = { chatCompletion };
