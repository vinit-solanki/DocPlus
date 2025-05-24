const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

// Create appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Find patient profile
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(400).json({ 
        message: 'Patient profile not found. Please complete your profile first.',
        requiresProfile: true 
      });
    }

    // Find doctor and get fees
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if slot is available
    const slot = doctor.availableSlots.find(
      slot => slot.date.toISOString().split('T')[0] === date && 
               slot.time === time && 
               slot.isAvailable
    );

    if (!slot) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      date: new Date(date),
      time,
      fees: doctor.fees,
      reason,
      status: 'pending'
    });

    await appointment.save();

    // Mark slot as unavailable
    slot.isAvailable = false;
    await doctor.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name speciality image')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel appointment
router.put('/cancel/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment already cancelled' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    // Make slot available again
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      const slot = doctor.availableSlots.find(
        slot => slot.date.toISOString().split('T')[0] === appointment.date.toISOString().split('T')[0] && 
                 slot.time === appointment.time
      );
      if (slot) {
        slot.isAvailable = true;
        await doctor.save();
      }
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Appointment is not in pending status' });
    }

    const options = {
      amount: appointment.fees * 100, // amount in paise
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'paid';
    appointment.paymentId = razorpay_payment_id;
    await appointment.save();

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;