const express = require('express');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or update patient profile
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body;

    // Check if patient profile already exists
    let patient = await Patient.findOne({ user: req.user._id });

    if (patient) {
      // Update existing patient
      patient.name = name || patient.name;
      patient.email = email || patient.email;
      patient.phone = phone || patient.phone;
      patient.address = address || patient.address;
      patient.gender = gender || patient.gender;
      patient.dob = dob || patient.dob;
      patient.bloodGroup = bloodGroup || patient.bloodGroup;
      
      await patient.save();
    } else {
      // Create new patient profile
      patient = new Patient({
        user: req.user._id,
        name: name || req.user.name,
        email: email || req.user.email,
        phone,
        address,
        gender,
        dob,
        bloodGroup
      });
      
      await patient.save();
    }

    res.json({
      message: 'Patient profile saved successfully',
      patient
    });
  } catch (error) {
    console.error('Patient profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current patient profile
router.get('/me', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;