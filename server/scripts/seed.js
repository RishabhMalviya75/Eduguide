/**
 * EduGuide AI — Seed Script
 *
 * Creates test data for development:
 *   - 1 School
 *   - 1 Admin user
 *   - 1 Teacher user
 *   - 5 Students
 *
 * Also verifies that tenant scoping works correctly:
 *   - Queries without school_id THROW (not silently return all data)
 *
 * Usage: npm run seed (from server directory)
 */

const mongoose = require('mongoose');
const config = require('../config');
const { connectDB, disconnectDB } = require('../config/db');
const { School, User, Student } = require('../models');
const authService = require('../services/authService');

async function seed() {
  console.log('🌱 Starting seed...\n');

  await connectDB();

  // Clear existing data (development only!)
  if (!config.isProduction) {
    console.log('   Clearing existing data...');
    await School.deleteMany({});
    await User.deleteMany({}).setOptions({ bypassScope: true });
    await Student.deleteMany({}).setOptions({ bypassScope: true });
  }

  // --- 1. Create a School ---
  console.log('   Creating test school...');
  const school = await School.create({
    name: 'Delhi Public School - Test Campus',
    school_code: 'DPS001',
    address: {
      street: '123 Education Lane',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    admin_contact: {
      name: 'Dr. Priya Sharma',
      phone: '+91-9876543210',
      email: 'admin@dps001.edu',
    },
  });
  console.log(`   ✅ School created: ${school.name} (Code: ${school.school_code})`);

  // --- 2. Create Admin User ---
  console.log('\n   Creating admin user...');
  const adminPassword = await authService.hashPassword('admin123');
  const admin = await User.create({
    school_id: school._id,
    role: 'Admin',
    name: 'Dr. Priya Sharma',
    email: 'admin@dps001.edu',
    password_hash: adminPassword,
  });
  console.log(`   ✅ Admin: ${admin.email} / password: admin123`);

  // --- 3. Create Teacher User ---
  console.log('   Creating teacher user...');
  const teacherPassword = await authService.hashPassword('teacher123');
  const teacher = await User.create({
    school_id: school._id,
    role: 'Teacher',
    name: 'Mr. Rahul Verma',
    email: 'rahul.verma@dps001.edu',
    password_hash: teacherPassword,
    assigned_classes: [
      { grade: 10, section: 'A' },
      { grade: 10, section: 'B' },
    ],
  });
  console.log(`   ✅ Teacher: ${teacher.email} / password: teacher123`);
  console.log(`      Assigned: Grade 10-A, 10-B`);

  // --- 3.5 Create Counselor User ---
  console.log('\n   Creating counselor user...');
  const counselorPassword = await authService.hashPassword('counselor123');
  const counselor = await User.create({
    school_id: school._id,
    role: 'Counselor',
    name: 'Ms. Neha Gupta',
    email: 'neha.gupta@dps001.edu',
    password_hash: counselorPassword,
  });
  console.log(`   ✅ Counselor: ${counselor.email} / password: counselor123`);

  // --- 4. Create Students ---
  console.log('\n   Creating test students...');
  const studentsData = [
    { roll_no: '1001', name: 'Aarav Patel', grade: 10, section: 'A', dob: '2010-03-15' },
    { roll_no: '1002', name: 'Diya Gupta', grade: 10, section: 'A', dob: '2010-07-22' },
    { roll_no: '1003', name: 'Kabir Singh', grade: 10, section: 'B', dob: '2010-01-08' },
    { roll_no: '2001', name: 'Ananya Reddy', grade: 9, section: 'A', dob: '2011-11-30' },
    { roll_no: '2002', name: 'Vihaan Kumar', grade: 9, section: 'A', dob: '2011-05-14' },
  ];

  for (const data of studentsData) {
    const student = await Student.create({
      school_id: school._id,
      ...data,
      dob: new Date(data.dob),
    });
    console.log(`   ✅ Student: ${student.name} (Roll: ${student.roll_no}, Grade ${student.grade}-${student.section})`);
  }

  // --- 5. Verify Tenant Scoping ---
  console.log('\n   🔒 Verifying tenant scoping...');

  // Test 1: Query WITH school_id should work
  const scopedStudents = await Student.find({ grade: 10 }).setOptions({
    schoolId: school._id.toString(),
  });
  console.log(`   ✅ Scoped query returned ${scopedStudents.length} students (expected: 3)`);

  // Test 2: Query WITHOUT school_id should THROW
  try {
    await Student.find({ grade: 10 });
    console.error('   ❌ SECURITY FAILURE: Query without school_id did NOT throw!');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('[TenantScope]')) {
      console.log('   ✅ Unscoped query correctly threw TenantScope error');
    } else {
      console.error('   ❌ Unexpected error:', err.message);
      process.exit(1);
    }
  }

  // Test 3: Bypass scope should work
  const allStudents = await Student.find({}).setOptions({ bypassScope: true });
  console.log(`   ✅ Bypassed query returned ${allStudents.length} students (expected: 5)`);

  // --- 6. Create Career Profiles (Sprint 5 Seed Data) ---
  console.log('\n   Creating Career Profiles...');
  const { CareerProfile } = require('../models');
  if (!config.isProduction) {
    await CareerProfile.deleteMany({}).setOptions({ bypassScope: true });
  }

  const careers = [
    {
      title: 'Engineering & Technology',
      description: 'Design, build, and maintain software, hardware, and infrastructure.',
      requirements: { 'Mathematics': 0.8, 'Science': 0.7, 'Logic': 0.9, 'Spatial': 0.6 }
    },
    {
      title: 'Medical & Healthcare',
      description: 'Treat patients, conduct medical research, and promote public health.',
      requirements: { 'Science': 0.9, 'Mathematics': 0.5, 'Verbal': 0.7, 'Logic': 0.6 }
    },
    {
      title: 'Arts & Humanities',
      description: 'Express creativity through design, writing, fine arts, and media.',
      requirements: { 'Verbal': 0.9, 'Spatial': 0.8, 'Logic': 0.4, 'Science': 0.2 }
    }
  ];

  for (const c of careers) {
    const profile = await CareerProfile.create([{
      school_id: school._id,
      title: c.title,
      description: c.description,
      requirements: c.requirements
    }], { bypassScope: true });
    console.log(`   ✅ Career Profile: ${profile[0].title}`);
  }

  // --- Summary ---
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Seed completed successfully!');
  console.log('='.repeat(50));
  console.log('\nTest Credentials:');
  console.log(`  School Code: ${school.school_code}`);
  console.log(`  Admin:     admin@dps001.edu / admin123`);
  console.log(`  Teacher:   rahul.verma@dps001.edu / teacher123`);
  console.log(`  Counselor: neha.gupta@dps001.edu / counselor123`);
  console.log(`  Student: School Code: DPS001, Roll: 1001, DOB: 2010-03-15`);
  console.log('           (Use verify-identity + set-pin flow for first login)\n');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
