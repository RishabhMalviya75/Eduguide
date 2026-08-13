/**
 * Migration: Set format='MCQ' on all existing Question documents.
 *
 * This is a one-time, idempotent migration script.
 * Safe to run multiple times — it only updates documents where format is not yet set.
 *
 * Usage: node scripts/migrateQuestionFormat.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');

async function migrate() {
  console.log('🔄 Migration: Question format field\n');
  console.log(`   Connecting to MongoDB at ${config.mongoUri}...`);
  await mongoose.connect(config.mongoUri);
  console.log('   Connected.\n');

  // Direct collection access to avoid Mongoose validation/scoping
  const db = mongoose.connection.db;
  const questionsCollection = db.collection('questions');

  // Count documents missing the format field
  const missingCount = await questionsCollection.countDocuments({
    format: { $exists: false }
  });

  console.log(`   Found ${missingCount} question(s) without a format field.`);

  if (missingCount === 0) {
    console.log('   ✅ Nothing to migrate. All questions already have a format.');
  } else {
    const result = await questionsCollection.updateMany(
      { format: { $exists: false } },
      { $set: { format: 'MCQ' } }
    );
    console.log(`   ✅ Updated ${result.modifiedCount} question(s) to format='MCQ'.`);
  }

  // Verify
  const total = await questionsCollection.countDocuments({});
  const withFormat = await questionsCollection.countDocuments({ format: { $exists: true } });
  console.log(`\n   Verification: ${withFormat}/${total} questions now have a format field.`);

  await mongoose.connection.close();
  console.log('\n   Done.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
