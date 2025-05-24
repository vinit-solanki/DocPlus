const Patient = require('../models/Patient');

const createPatient = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body;

    let patient = await Patient.findOne({ user: userId });
    
    if (!patient) {
      patient = new Patient({
        user: userId,
        name,
        email,
        phone,
        address,
        gender,
        dob,
        bloodGroup
      });
    } else {
      patient.name = name;
      patient.email = email;
      patient.phone = phone;
      patient.address = address;
      patient.gender = gender;
      patient.dob = dob;
      patient.bloodGroup = bloodGroup;
    }

    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error saving patient', error: error.message });
  }
};

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
  createPatient,
  getPatient,
  updatePatient
};