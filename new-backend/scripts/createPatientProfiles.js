// createPatientProfiles.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const dotenv = require('dotenv');

dotenv.config();
async function createPatientProfiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB', process.env.MONGO_URI);
    const users = await User.find({ role: 'patient' });
    for (const user of users) {
      const existingPatient = await Patient.findOne({ user: user._id });
      if (!existingPatient) {
        const patient = new Patient({
          user: user._id,
          name: user.name || '',
          email: user.email || '',
        });
        await patient.save();
        console.log(`Created patient profile for user: ${user._id}`);
        // Update user's profileId
        user.profileId = patient._id;
        await user.save();
      }
    }
    console.log('Patient profile creation complete');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating patient profiles:', error);
  }
}

createPatientProfiles();