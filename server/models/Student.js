const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const studentSchema = new mongoose.Schema(
  {
    roll_no: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      min: [1, 'Grade must be between 1 and 12'],
      max: [12, 'Grade must be between 1 and 12'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required for first-login verification'],
    },
    pin_hash: {
      type: String,
      default: null,
      select: false, // Never returned in queries by default
    },
    has_set_pin: {
      type: Boolean,
      default: false,
    },
    consent_flag: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Apply tenant scoping — adds school_id and enforces query isolation
studentSchema.plugin(schoolScope);

// Compound unique index: roll_no must be unique within a school
studentSchema.index({ school_id: 1, roll_no: 1 }, { unique: true });

// Index for login lookups (school_id comes from schoolScope plugin index)
studentSchema.index({ school_id: 1, roll_no: 1, is_active: 1 });

// Index for class roster queries
studentSchema.index({ school_id: 1, grade: 1, section: 1 });

// Ensure pin_hash is never serialized to JSON
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.pin_hash;
  return obj;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
