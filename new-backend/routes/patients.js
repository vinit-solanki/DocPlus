const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Validate phone (if provided)
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    // Validate dob (if provided)
    if (dob && isNaN(new Date(dob).getTime())) {
      return res.status(400).json({ message: 'Invalid date of birth' });
    }

    // Validate bloodGroup (if provided)
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '', null];
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    // Validate gender (if provided)
    const validGenders = ['male', 'female', 'other', '', null];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }

    // Check if patient profile exists
    let patient = await Patient.findOne({ user: req.user._id });

    if (patient) {
      // Update existing patient
      patient.name = name;
      patient.email = email;
      patient.phone = phone || '';
      patient.address = address || '';
      patient.gender = gender || '';
      patient.dob = dob ? new Date(dob) : null;
      patient.bloodGroup = bloodGroup || '';
    } else {
      // Create new patient profile
      patient = new Patient({
        user: req.user._id,
        name,
        email,
        phone: phone || '',
        address: address || '',
        gender: gender || '',
        dob: dob ? new Date(dob) : null,
        bloodGroup: bloodGroup || '',
      });
    }

    console.log('Saving patient profile with data:', patient);
    await patient.save();

    // Update User's profileId if not set
    const user = await User.findById(req.user._id);
    if (!user.profileId && user.role === 'patient') {
      user.profileId = patient._id;
      await user.save();
    }

    res.json({
      message: 'Patient profile saved successfully',
      patient,
    });
  } catch (error) {
    console.error('Patient profile error:', error);
    res.status(500).json({
      message: 'Server error during profile save',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;