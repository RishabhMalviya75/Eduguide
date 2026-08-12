const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: ['Admin', 'Teacher'],
        message: 'Role must be Admin or Teacher',
      },
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never returned in queries by default
    },
    assigned_classes: [
      {
        grade: {
          type: Number,
          required: true,
          min: 1,
          max: 12,
        },
        section: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        _id: false,
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
    last_login: {
      type: Date,
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
userSchema.plugin(schoolScope);

// Compound unique index: email must be unique within a school
userSchema.index({ school_id: 1, email: 1 }, { unique: true });

// Ensure password_hash is never serialized to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
