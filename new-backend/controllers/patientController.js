const Patient = require('../models/Patient');

const getPatient = async (req, res) => {
  try {
    // Use the user ID from the auth middleware
    const patient = await Patient.findOne({ user: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient data', error: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    // Extract fields from request body
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body;
    
    // Update patient using user reference
    const patient = await Patient.findOneAndUpdate(
      { user: req.user.userId },
      {
        name,
        email,
        phone,
        address,
        gender,
        dob,
        bloodGroup
      },
      { new: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient data', error: error.message });
  }
};

module.exports = {
  getPatient,
  updatePatient
};