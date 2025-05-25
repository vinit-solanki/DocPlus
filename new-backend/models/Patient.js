const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // Removed unique: true to avoid conflicts
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''], // Allow empty string
    default: '',
  },
  dob: {
    type: Date,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '', null],
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Patient', patientSchema);