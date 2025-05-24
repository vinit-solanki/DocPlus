const express = require('express');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctors by speciality
router.get('/speciality/:speciality', async (req, res) => {
  try {
    const { speciality } = req.params;
    const doctors = await Doctor.find({ 
      speciality: { $regex: new RegExp(speciality, 'i') } 
    });
    
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors by speciality error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;