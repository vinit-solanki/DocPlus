const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'patient',
    });

    await user.save();

    // Create patient profile if role is patient
    let patient = null;
    if (role === 'patient') {
      patient = new Patient({
        user: user._id,
        name: name || '',
        email: email || '',
      });
      await patient.save();
      console.log('Patient profile created for user:', user._id);

      // Update user's profileId
      user.profileId = patient._id;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists in patient database' });
    }
    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    let profile = null;

    if (req.user.role === 'patient') {
      profile = await Patient.findOne({ user: req.user._id });
    }

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profileId: req.user.profileId,
      profile,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// New route to update User details
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate inputs
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check for email uniqueness
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use by another user' });
    }

    // Update user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    await user.save();

    // If patient, update Patient email to maintain consistency
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        patient.name = name;
        patient.email = email;
        await patient.save();
      }
    }

    res.json({
      message: 'User details updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists in patient database' });
    }
    res.status(500).json({
      message: 'Server error during user update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;