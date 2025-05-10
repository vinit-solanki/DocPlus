const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  dob: {
    type: Date
  },
  bloodGroup: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);