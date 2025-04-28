const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // Clerk user ID
  name: { type: String }, // Optional, populated from Clerk or form
  email: { type: String }, // Optional, populated from Clerk or form
  phone: { type: String },
  address: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other', ''] },
  dob: { type: Date },
  bloodGroup: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);