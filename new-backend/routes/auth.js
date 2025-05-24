const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, role = 'patient' } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user first
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    
    await user.save();
    
    // Then create the patient with reference to the user
    if (role === 'patient') {
      const patient = new Patient({
        name,
        email,
        user: user._id  // Reference to the user
      });
      await patient.save();
      
      // Update the user with the profile reference
      user.profileId = patient._id;
      await user.save();
    }
    
    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name, 
        email, 
        role 
      } 
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
    try {
      res.json({ userId: req.user.userId });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
});

module.exports = router;