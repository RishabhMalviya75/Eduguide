const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    school_code: {
      type: String,
      required: [true, 'School code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [4, 'School code must be at least 4 characters'],
      maxlength: [8, 'School code must be at most 8 characters'],
      match: [/^[A-Z0-9]+$/, 'School code must be alphanumeric'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, 'Pincode must be 6 digits'],
      },
    },
    admin_contact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
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

// Note: School does NOT use the schoolScope plugin — it IS the tenant root.

const School = mongoose.model('School', schoolSchema);

module.exports = School;
