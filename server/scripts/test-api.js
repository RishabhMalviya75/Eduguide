/**
 * EduGuide AI — API Test Runner
 * 
 * Tests all Phase 0 endpoints automatically.
 * No external dependencies — uses Node.js built-in fetch.
 * 
 * Usage: node scripts/test-api.js
 * (Make sure the server is running on port 5000 first)
 */

const BASE = 'http://localhost:5000/api';

// State — tokens and IDs collected during test run
const state = {};

// Helpers
async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  return { status: res.status, data };
}

function log(label, status, expected, passed, detail = '') {
  const icon = passed ? '✅' : '❌';
  const statusStr = `${status}`.padStart(3);
  console.log(`  ${icon} [${statusStr}] ${label}${detail ? ' — ' + detail : ''}`);
  if (!passed) {
    console.log(`         Expected: ${expected}, Got: ${status}`);
  }
}

async function test(label, method, path, { body, token, expect = 200, save } = {}) {
  try {
    const { status, data } = await request(method, path, body, token);
    const passed = status === expect;
    log(label, status, expect, passed);

    if (save && data.data) {
      for (const [key, valuePath] of Object.entries(save)) {
        const value = valuePath.split('.').reduce((obj, k) => obj?.[k], data.data);
        if (value) state[key] = value;
      }
    }

    return { status, data, passed };
  } catch (err) {
    console.log(`  ❌ [ERR] ${label} — ${err.message}`);
    return { status: 0, data: null, passed: false };
  }
}

async function runTests() {
  console.log('\n🧪 EduGuide AI — API Test Runner');
  console.log('================================\n');

  let total = 0, passed = 0;
  const check = (r) => { total++; if (r.passed) passed++; };

  // ---- Health ----
  console.log('🟢 Health');
  check(await test('Health Check', 'GET', '/health'));

  // ---- Auth ----
  console.log('\n🔑 Auth');

  check(await test('Admin Login', 'POST', '/auth/staff/login', {
    body: { email: 'admin@dps001.edu', password: 'admin123' },
    save: { admin_token: 'token', admin_id: 'user.id', admin_school: 'user.school_id' },
  }));

  check(await test('Teacher Login', 'POST', '/auth/staff/login', {
    body: { email: 'rahul.verma@dps001.edu', password: 'teacher123' },
    save: { teacher_token: 'token' },
  }));

  check(await test('Wrong Password', 'POST', '/auth/staff/login', {
    body: { email: 'admin@dps001.edu', password: 'wrong' },
    expect: 401,
  }));

  check(await test('Student Verify Identity', 'POST', '/auth/student/verify-identity', {
    body: { school_code: 'DPS001', roll_no: '1002', dob: '2010-07-22' },
    save: { identity_token: 'identity_token' },
  }));

  if (state.identity_token) {
    check(await test('Student Set PIN', 'POST', '/auth/student/set-pin', {
      body: { identity_token: state.identity_token, pin: '5678' },
      expect: 201,
      save: { student_token: 'token', student_id: 'student.id' },
    }));

    check(await test('Student Login with PIN', 'POST', '/auth/student/login', {
      body: { school_code: 'DPS001', roll_no: '1002', pin: '5678' },
      save: { student_token: 'token' },
    }));
  }

  check(await test('Student Wrong PIN', 'POST', '/auth/student/login', {
    body: { school_code: 'DPS001', roll_no: '1002', pin: '0000' },
    expect: 401,
  }));

  // ---- Schools ----
  console.log('\n🏫 Schools');

  check(await test('Create School', 'POST', '/schools', {
    body: {
      name: 'Test Academy',
      school_code: 'TST001',
      address: { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
      admin_contact: { name: 'Test Admin', email: 'admin@test.edu' },
    },
    expect: 201,
    save: { new_school_id: '_id' },
  }));

  check(await test('List Schools', 'GET', '/schools', {
    token: state.admin_token,
  }));

  if (state.new_school_id) {
    check(await test('Get School by ID', 'GET', `/schools/${state.new_school_id}`, {
      token: state.admin_token,
    }));
  }

  // ---- Staff Users ----
  console.log('\n👨‍🏫 Staff Users');

  check(await test('List Staff', 'GET', '/users', {
    token: state.admin_token,
  }));

  check(await test('Create Teacher', 'POST', '/users', {
    token: state.admin_token,
    body: {
      name: 'Ms. Anita Roy',
      email: 'anita.roy@dps001.edu',
      password: 'teacher456',
      role: 'Teacher',
      assigned_classes: [{ grade: 9, section: 'A' }],
    },
    expect: 201,
    save: { new_user_id: '_id' },
  }));

  if (state.new_user_id) {
    check(await test('Get Staff by ID', 'GET', `/users/${state.new_user_id}`, {
      token: state.admin_token,
    }));

    check(await test('Update Staff', 'PUT', `/users/${state.new_user_id}`, {
      token: state.admin_token,
      body: { assigned_classes: [{ grade: 9, section: 'A' }, { grade: 9, section: 'B' }] },
    }));

    check(await test('Reset Staff Password', 'PUT', `/users/${state.new_user_id}/reset-password`, {
      token: state.admin_token,
      body: { new_password: 'newpass123' },
    }));
  }

  // ---- Students ----
  console.log('\n🎓 Students');

  check(await test('List All Students', 'GET', '/students', {
    token: state.admin_token,
  }));

  check(await test('List Students (Grade 10-A)', 'GET', '/students?grade=10&section=A', {
    token: state.admin_token,
  }));

  check(await test('Create Student', 'POST', '/students', {
    token: state.admin_token,
    body: { roll_no: '4001', name: 'Test Student', grade: 10, section: 'A', dob: '2010-06-20' },
    expect: 201,
    save: { new_student_id: '_id' },
  }));

  check(await test('Batch Create Students', 'POST', '/students/batch', {
    token: state.admin_token,
    body: {
      students: [
        { roll_no: '4002', name: 'Batch Student 1', grade: 10, section: 'B', dob: '2010-02-11' },
        { roll_no: '4003', name: 'Batch Student 2', grade: 10, section: 'B', dob: '2010-09-05' },
      ],
    },
    expect: 201,
  }));

  if (state.new_student_id) {
    check(await test('Get Student by ID', 'GET', `/students/${state.new_student_id}`, {
      token: state.admin_token,
    }));

    check(await test('Update Student', 'PUT', `/students/${state.new_student_id}`, {
      token: state.admin_token,
      body: { consent_flag: true },
    }));

    check(await test('Reset Student PIN', 'PUT', `/students/${state.new_student_id}/reset-pin`, {
      token: state.admin_token,
    }));
  }

  // ---- RBAC ----
  console.log('\n🚫 RBAC Tests');

  check(await test('No Token → List Users (401)', 'GET', '/users', {
    expect: 401,
  }));

  check(await test('Teacher → Create User (403)', 'POST', '/users', {
    token: state.teacher_token,
    body: { name: 'Hacker', email: 'hack@test.com', password: 'test', role: 'Admin' },
    expect: 403,
  }));

  check(await test('Teacher → List Students (200)', 'GET', '/students', {
    token: state.teacher_token,
  }));

  if (state.student_token && state.new_student_id) {
    check(await test('Student → Other Student (403)', 'GET', `/students/${state.new_student_id}`, {
      token: state.student_token,
      expect: 403,
    }));
  }

  // ---- Summary ----
  console.log('\n================================');
  console.log(`📊 Results: ${passed}/${total} passed`);
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed`);
  }
  console.log('================================\n');
}

runTests().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
