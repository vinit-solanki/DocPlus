const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  image: { type: String, default: '' },
  about: { type: String, default: '' },
  fees: { type: Number, required: true },
  availableSlots: [
    {
      date: { type: Date, required: true },
      time: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);