const { Student } = require('../models');
const TestSession = require('../models/TestSession');
const CareerProfile = require('../models/CareerProfile');

/**
 * Normalizes an array of subject marks (0-100) into an object keyed by subject.
 * Also averages out duplicate subjects if they exist.
 */
function normalizeMarks(marks) {
  if (!marks || marks.length === 0) return {};
  
  const totals = {};
  const counts = {};

  marks.forEach(m => {
    // Basic normalization to a 0-1 percentage
    const normalizedScore = m.marks_obtained / m.max_marks;
    const subject = m.subject;
    
    if (!totals[subject]) {
      totals[subject] = 0;
      counts[subject] = 0;
    }
    totals[subject] += normalizedScore;
    counts[subject] += 1;
  });

  const averages = {};
  for (const subject in totals) {
    averages[subject] = totals[subject] / counts[subject];
  }

  return averages;
}

/**
 * A highly simplified mock of "extracting skills from aptitude tests" for MVP.
 * In a real app, each question would have a category and we'd calculate score per category.
 * Since our TestSession currently just gives an overall score, we will artificially 
 * project that score across the required cognitive skills as a baseline for the MVP.
 */
function normalizeAptitudeScores(testSessions) {
  if (!testSessions || testSessions.length === 0) return null;
  
  // Grab their best test score
  let bestScore = 0;
  testSessions.forEach(session => {
    if (session.score && session.max_score) {
      const percentage = session.score / session.max_score;
      if (percentage > bestScore) bestScore = percentage;
    }
  });

  // For MVP, we'll assign their best overall aptitude score to the cognitive categories.
  // Real app: calculate score per category (Logic, Verbal, etc) based on the specific questions answered correctly.
  return {
    'Logic': bestScore,
    'Verbal': bestScore,
    'Spatial': bestScore
  };
}

/**
 * Core Algorithm: Calculates Career Matches for a Student
 */
exports.calculateCareerMatches = async (studentId, schoolId) => {
  // 1. Fetch Student Data (includes their marks array)
  const student = await Student.findById(studentId).setOptions({ schoolId });
  if (!student) throw new Error("Student not found");

  // 2. Fetch Student's Aptitude Tests
  const tests = await TestSession.find({ student_id: studentId, status: 'completed' }).setOptions({ schoolId });

  // 3. Normalize their stats
  const academicStats = normalizeMarks(student.marks || []);
  const aptitudeStats = normalizeAptitudeScores(tests);

  // If they have no data at all, return empty
  if (Object.keys(academicStats).length === 0 && !aptitudeStats) {
    return { matches: [], academicStats, aptitudeStats };
  }

  // Combine into a single student profile (50/50 weight where they overlap, but here they mostly don't overlap)
  const studentProfile = { ...academicStats, ...aptitudeStats };

  // 4. Fetch Career Profiles
  const careers = await CareerProfile.find({ is_active: true }).setOptions({ schoolId });

  // 5. Calculate match percentages
  const matches = careers.map(career => {
    let totalWeight = 0;
    let earnedScore = 0;

    // For each requirement in the career
    for (const [skill, weight] of career.requirements.entries()) {
      totalWeight += weight;
      // If student has this skill, add to their score. If not, they get 0 for this requirement.
      const studentSkillScore = studentProfile[skill] || 0;
      earnedScore += (studentSkillScore * weight);
    }

    // Calculate final match percentage (0-100)
    const matchPercentage = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;

    return {
      careerId: career._id,
      title: career.title,
      description: career.description,
      matchPercentage: Math.round(matchPercentage)
    };
  });

  // 6. Sort by highest match and return top 3
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  const topMatches = matches.slice(0, 3);

  return {
    matches: topMatches,
    academicStats,
    aptitudeStats
  };
};
