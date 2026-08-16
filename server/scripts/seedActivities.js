const mongoose = require('mongoose');
const config = require('../config');
const { School, User, Activity } = require('../models');

async function seedActivities() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected.');

    // Find first school
    let school = await School.findOne();
    if (!school) {
      console.log('No school found. Creating default school...');
      school = await School.create({
        name: 'Delhi Public School, Vasant Kunj',
        code: 'DPS-VK-01',
        city: 'New Delhi',
        state: 'Delhi',
      });
    }

    // Find teacher or admin
    let staffUser = await User.findOne({ school_id: school._id, role: { $in: ['Teacher', 'Admin'] } });
    if (!staffUser) {
      console.log('No staff user found. Creating sample teacher user...');
      staffUser = await User.create({
        school_id: school._id,
        name: 'Ms. Sunita Sharma',
        email: 'sunita.sharma@dpsvk.edu.in',
        password_hash: 'dummy_hash',
        role: 'Teacher',
        assigned_classes: [
          { grade: 9, section: 'A' },
          { grade: 10, section: 'B' },
        ],
      });
    }

    console.log(`Using School: ${school.name} (${school._id})`);
    console.log(`Using Staff User: ${staffUser.name} (${staffUser.role})`);

    // Clean existing activities for this school if needed
    const deletedCount = await Activity.deleteMany({ school_id: school._id }).setOptions({ bypassScope: true });
    console.log(`Cleared ${deletedCount.deletedCount} existing activities.`);

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const deadlineSoon = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const deadlineNextMonth = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);

    const sampleActivities = [
      {
        school_id: school._id,
        title: 'Inter-School Cultural & Drama Festival "Tarang 2026"',
        category: 'Cultural & Performing Arts',
        description: 'An exciting annual performing arts showcase featuring street play, classical dance, acoustic music band competitions, and theatrical drama performances.',
        date: nextMonth,
        time: '09:00 AM - 04:00 PM',
        location: 'Main School Auditorium & Amphitheatre',
        eligibility: {
          grades: [7, 8, 9, 10, 11, 12],
          text: 'Classes 7 to 12',
        },
        maxParticipants: 45,
        registrationDeadline: deadlineNextMonth,
        registrationDetails: 'Audition rounds will be held in Room 102 prior to the main stage performance. Props provided by school.',
        organizer: {
          user_id: staffUser._id,
          name: staffUser.name,
          role: staffUser.role,
          email: staffUser.email,
        },
        status: 'active',
      },
      {
        school_id: school._id,
        title: 'Inter-House Basketball Tournament & Athletics Championship',
        category: 'Sports & Physical Activity',
        description: 'Compete for your house in 5v5 basketball matches, 100m sprint, relay races, and long jump. Medals and house trophies awarded to top scorers!',
        date: nextWeek,
        time: '08:00 AM - 02:00 PM',
        location: 'School Sports Complex & Outdoor Courts',
        eligibility: {
          grades: [6, 7, 8, 9, 10, 11, 12],
          text: 'Classes 6 to 12 (All Houses)',
        },
        maxParticipants: 60,
        registrationDeadline: deadlineSoon,
        registrationDetails: 'Standard sports jersey and non-marking shoes required. Medical clearance form must be signed.',
        organizer: {
          user_id: staffUser._id,
          name: 'Coach Vikram Rathore',
          role: 'Teacher',
          email: 'vikram.sports@dpsvk.edu.in',
        },
        status: 'active',
      },
      {
        school_id: school._id,
        title: 'National Junior Science & Innovation Exhibition',
        category: 'Academic & Intellectual',
        description: 'Showcase working science models, renewable energy prototypes, AI applications, and STEM experiments. Top 3 projects move to State Level!',
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        time: '10:00 AM - 03:30 PM',
        location: 'Science Block Laboratories & Hall B',
        eligibility: {
          grades: [8, 9, 10, 11, 12],
          text: 'Classes 8 to 12',
        },
        maxParticipants: 30,
        registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        registrationDetails: 'Submit project abstract along with registration. Maximum 3 members per team.',
        organizer: {
          user_id: staffUser._id,
          name: staffUser.name,
          role: staffUser.role,
          email: staffUser.email,
        },
        status: 'active',
      },
      {
        school_id: school._id,
        title: 'Model United Nations (MUN) & Youth Parliament',
        category: 'Leadership, Service & Life Skills',
        description: 'Simulate committee sessions of the UN General Assembly and Security Council. Debate pressing global geopolitics, draft resolutions, and build diplomacy skills.',
        date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        time: '09:30 AM - 05:00 PM',
        location: 'Conference Room & Senior Block Seminar Hall',
        eligibility: {
          grades: [9, 10, 11, 12],
          text: 'Classes 9 to 12',
        },
        maxParticipants: 40,
        registrationDeadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        registrationDetails: 'Delegate portfolio allotments will be published 5 days prior to the conference.',
        organizer: {
          user_id: staffUser._id,
          name: 'Mr. Rajesh Verma',
          role: 'Teacher',
          email: 'rajesh.verma@dpsvk.edu.in',
        },
        status: 'active',
      },
      {
        school_id: school._id,
        title: 'Hands-on Robotics & AI Bootcamp (Skill-Building Workshop)',
        category: 'Seasonal / Skill-Building',
        description: 'Construct line-following autonomous robots, program microcontrollers using Python, and build your first machine learning model.',
        date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        time: '01:00 PM - 04:30 PM',
        location: 'Computer Lab 3 & Robotics Innovation Hub',
        eligibility: {
          grades: [6, 7, 8, 9, 10],
          text: 'Classes 6 to 10',
        },
        maxParticipants: 25,
        registrationDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        registrationDetails: 'Laptops and hardware components will be provided during the workshop sessions.',
        organizer: {
          user_id: staffUser._id,
          name: staffUser.name,
          role: staffUser.role,
          email: staffUser.email,
        },
        status: 'active',
      },
    ];

    const created = await Activity.insertMany(sampleActivities, { bypassScope: true });
    console.log(`Successfully seeded ${created.length} sample activities across all 5 categories!`);

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Error seeding activities:', err);
    process.exit(1);
  }
}

seedActivities();
