require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { School } = require('../models');
const Question = require('../models/Question');

const dummyQuestions = [
  // MATH
  {
    text: "If a train travels 60 miles in 1.5 hours, what is its average speed in miles per hour?",
    options: ["30", "40", "45", "50"],
    correct_option_index: 1,
    category: "Math",
    difficulty: 2
  },
  {
    text: "What is the value of x in the equation 3x + 7 = 22?",
    options: ["3", "5", "7", "9"],
    correct_option_index: 1,
    category: "Math",
    difficulty: 1
  },
  {
    text: "If a rectangle has a length of 12 and an area of 60, what is its perimeter?",
    options: ["17", "24", "34", "60"],
    correct_option_index: 2,
    category: "Math",
    difficulty: 2
  },
  {
    text: "What is 15% of 80?",
    options: ["10", "12", "14", "15"],
    correct_option_index: 1,
    category: "Math",
    difficulty: 1
  },
  
  // LOGIC
  {
    text: "If all ZURKS are PLINKS, and some PLINKS are BAZZLES, which of the following must be true?",
    options: [
      "All ZURKS are BAZZLES",
      "Some ZURKS are BAZZLES",
      "All BAZZLES are PLINKS",
      "Not enough information"
    ],
    correct_option_index: 3,
    category: "Logic",
    difficulty: 3
  },
  {
    text: "Look at this series: 2, 6, 18, 54, ... What number should come next?",
    options: ["108", "148", "162", "216"],
    correct_option_index: 2,
    category: "Logic",
    difficulty: 2
  },
  {
    text: "Odometer is to mileage as compass is to:",
    options: ["Speed", "Hiking", "Needle", "Direction"],
    correct_option_index: 3,
    category: "Logic",
    difficulty: 1
  },
  {
    text: "Which word does not belong with the others?",
    options: ["Parsley", "Basil", "Dill", "Mayonnaise"],
    correct_option_index: 3,
    category: "Logic",
    difficulty: 1
  },

  // VERBAL
  {
    text: "Choose the word that is most nearly opposite in meaning to 'ABUNDANT':",
    options: ["Scarce", "Plentiful", "Ample", "Heavy"],
    correct_option_index: 0,
    category: "Verbal",
    difficulty: 2
  },
  {
    text: "Select the word that best completes the sentence: The committee's decision was ______, leaving no room for appeal.",
    options: ["ambiguous", "tentative", "irrevocable", "preliminary"],
    correct_option_index: 2,
    category: "Verbal",
    difficulty: 3
  },
  {
    text: "Identify the incorrectly spelled word:",
    options: ["Accommodate", "Embarrass", "Millennium", "Definately"],
    correct_option_index: 3,
    category: "Verbal",
    difficulty: 2
  },
  {
    text: "What is a synonym for 'METICULOUS'?",
    options: ["Careless", "Fastidious", "Hasty", "Sloppy"],
    correct_option_index: 1,
    category: "Verbal",
    difficulty: 3
  }
];

async function seedQuestions() {
  try {
    console.log(`Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    // Get the first active school to attach these questions to
    const school = await School.findOne({ school_code: 'DPS001' });
    if (!school) {
      console.error('School DPS001 not found. Please run the main seed script first.');
      process.exit(1);
    }
    const schoolId = school._id;

    // Delete existing questions for this school to avoid duplicates
    console.log('Clearing existing questions for DPS001...');
    // Bypass scope since this is a script
    await Question.deleteMany({ school_id: schoolId }).setOptions({ bypassScope: true });

    console.log(`Inserting ${dummyQuestions.length} questions...`);
    const questionsToInsert = dummyQuestions.map(q => ({
      ...q,
      school_id: schoolId
    }));

    // Bypass scope for bulk insert
    await Question.insertMany(questionsToInsert, { bypassScope: true });
    
    console.log('✅ Successfully seeded aptitude questions!');
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedQuestions();
