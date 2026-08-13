require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { School } = require('../models');
const CareerProfile = require('../models/CareerProfile');

const dummyCareers = [
  {
    title: 'Software Engineer',
    description: 'Design, develop, and maintain software systems. Requires strong logical thinking and problem-solving skills.',
    requirements: {
      'Logic': 1.0,
      'Math': 0.8,
      'Science': 0.6,
      'Verbal': 0.3
    }
  },
  {
    title: 'Data Analyst',
    description: 'Translate numbers and data into understandable insights. Highly dependent on math and logical reasoning.',
    requirements: {
      'Math': 1.0,
      'Logic': 0.8,
      'Science': 0.4,
      'Verbal': 0.4
    }
  },
  {
    title: 'Journalist / Writer',
    description: 'Investigate stories and write compelling articles. Requires excellent verbal and communication skills.',
    requirements: {
      'Verbal': 1.0,
      'History': 0.7,
      'Logic': 0.5,
      'Math': 0.2
    }
  },
  {
    title: 'Medical Professional',
    description: 'Diagnose and treat patients. Requires extensive scientific knowledge and strong problem-solving abilities.',
    requirements: {
      'Science': 1.0,
      'Logic': 0.7,
      'Math': 0.6,
      'Verbal': 0.5
    }
  },
  {
    title: 'Business Manager',
    description: 'Lead teams and manage company operations. A balanced mix of communication, logic, and basic math.',
    requirements: {
      'Verbal': 0.8,
      'Logic': 0.7,
      'Math': 0.6,
      'History': 0.5
    }
  }
];

async function seedCareers() {
  try {
    console.log(`Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    // Get the first active school to attach these careers to
    const school = await School.findOne({ school_code: 'DPS001' });
    if (!school) {
      console.error('School DPS001 not found. Please run the main seed script first.');
      process.exit(1);
    }
    const schoolId = school._id;

    // Delete existing careers for this school to avoid duplicates
    console.log('Clearing existing careers for DPS001...');
    await CareerProfile.deleteMany({ school_id: schoolId }).setOptions({ bypassScope: true });

    console.log(`Inserting ${dummyCareers.length} career profiles...`);
    const careersToInsert = dummyCareers.map(c => ({
      ...c,
      school_id: schoolId
    }));

    // Bypass scope for bulk insert
    await CareerProfile.insertMany(careersToInsert, { bypassScope: true });
    
    console.log('✅ Successfully seeded career profiles!');
  } catch (error) {
    console.error('Error seeding careers:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedCareers();
