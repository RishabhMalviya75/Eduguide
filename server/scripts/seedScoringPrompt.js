/**
 * Seed: Initial Scoring Prompt (v1.0.0)
 *
 * Creates the first versioned AI scoring prompt in the PromptVersion collection.
 * This prompt instructs the LLM to evaluate student test responses.
 *
 * Usage: node scripts/seedScoringPrompt.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { School } = require('../models');
const PromptVersion = require('../models/PromptVersion');
const User = require('../models/User');

const SCORING_PROMPT_V1 = `You are an expert educational assessment evaluator for a career guidance platform.

Your task is to evaluate a student's test responses with precision and provide a confidence score for each evaluation.

RULES:
1. For each question, determine if the student's answer is correct by comparing it to the provided correct answer.
2. Assign a confidence score between 0.0 and 1.0 for each evaluation:
   - 1.0 = Completely certain (clear-cut MCQ with obvious correct/incorrect)
   - 0.7-0.9 = High confidence (standard evaluation)
   - 0.4-0.6 = Moderate confidence (ambiguous or debatable)
   - Below 0.4 = Low confidence (requires human review)
3. For MCQ questions, confidence should generally be high (0.85-1.0) since answers are deterministic.
4. Provide brief reasoning for each evaluation.

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact structure:
{
  "evaluations": [
    {
      "question_index": 0,
      "is_correct": true,
      "confidence": 0.95,
      "reasoning": "Student selected the correct answer 'Option A' which matches the expected answer."
    }
  ]
}

IMPORTANT:
- Return one evaluation per question in the same order they were provided.
- Do NOT add any text outside the JSON object.
- Always return valid JSON.`;

async function seedScoringPrompt() {
  try {
    console.log(`Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('Connected.\n');

    // Get the school
    const school = await School.findOne({ school_code: 'DPS001' });
    if (!school) {
      console.error('School DPS001 not found. Run the main seed script first.');
      process.exit(1);
    }

    // Get the admin user to set as created_by
    const admin = await User.findOne({ role: 'Admin' }).setOptions({ schoolId: school._id.toString() });
    if (!admin) {
      console.error('Admin user not found.');
      process.exit(1);
    }

    // Deactivate any existing scoring prompts for this school
    await PromptVersion.updateMany(
      { school_id: school._id, purpose: 'scoring' },
      { is_active: false }
    ).setOptions({ bypassScope: true });

    // Create the new prompt version
    const prompt = await PromptVersion.create([{
      school_id: school._id,
      version_id: '1.0.0',
      prompt_text: SCORING_PROMPT_V1,
      model_reference: config.ai.model,
      purpose: 'scoring',
      created_by: admin._id,
      is_active: true,
    }], { bypassScope: true });

    console.log('✅ Scoring prompt v1.0.0 seeded successfully!');
    console.log(`   Prompt ID: ${prompt[0]._id}`);
    console.log(`   Model: ${config.ai.model}`);
    console.log(`   Mock mode: ${config.ai.isMockMode}`);

  } catch (error) {
    console.error('Error seeding scoring prompt:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedScoringPrompt();
