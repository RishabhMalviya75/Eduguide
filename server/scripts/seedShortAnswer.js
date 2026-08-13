require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { School, Question } = require('../models');

async function seedShortAnswer() {
  try {
    await mongoose.connect(config.mongoUri);
    const school = await School.findOne({ school_code: 'DPS001' });

    await Question.create([{
      school_id: school._id,
      text: 'Explain in one sentence why data structures are important in software engineering.',
      category: 'Logic',
      difficulty: 2,
      format: 'short_answer',
      options: [],
      expected_answers: ['efficiency', 'organization', 'performance', 'scalability'],
      scoring_rubric: 'Award 1 point if the student mentions organizing data efficiently, performance, or scalability.',
      is_active: true
    }], { bypassScope: true });

    console.log('✅ Seeded short_answer question successfully.');
  } catch (error) {
    console.error('Seed failed', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedShortAnswer();
