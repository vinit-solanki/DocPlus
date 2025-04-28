const Patient = require('../models/Patient');

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ clerkId: req.auth.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body;
    console.log('Updating patient for clerkId:', req.auth.userId, 'with data:', req.body);

    let patient = await Patient.findOne({ clerkId: req.auth.userId });

    if (!patient) {
      patient = new Patient({
        clerkId: req.auth.userId,
        name: name || '',
        email: email || '',
        phone: phone || '',
        address,
        gender,
        dob,
        bloodGroup,
      });
    } else {
      patient.name = name !== undefined ? name : patient.name;
      patient.email = email !== undefined ? email : patient.email;
      patient.phone = phone !== undefined ? phone : patient.phone;
      patient.address = address !== undefined ? address : patient.address;
      patient.gender = gender !== undefined ? gender : patient.gender;
      patient.dob = dob !== undefined ? dob : patient.dob;
      patient.bloodGroup = bloodGroup !== undefined ? bloodGroup : patient.bloodGroup;
    }

    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error updating patient:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to update patient', error: error.message });
  }
};