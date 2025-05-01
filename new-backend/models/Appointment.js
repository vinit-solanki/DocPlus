const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  fees: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  paymentId: {
    type: String,
  },
}, { 
  timestamps: true  // This adds createdAt and updatedAt fields automatically
});

const currentDate = new Date();
const twoDaysAgo = new Date(currentDate - 48 * 60 * 60 * 1000);

module.exports = mongoose.model('Appointment', appointmentSchema);