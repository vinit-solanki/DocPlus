const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createAppointment = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { doctorId, date, time, reason } = req.body;

    console.log('Creating appointment for clerkId:', userId, 'with data:', req.body);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const patient = await Patient.findOne({ clerkId: userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found. Please update your profile first.' });
    }

    const slot = doctor.availableSlots.find(
      (s) => s.date.toISOString().split('T')[0] === date && s.time === time && s.isAvailable
    );
    if (!slot) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      date: new Date(date),
      time,
      fees: doctor.fees,
      reason,
      status: 'pending',
    });

    slot.isAvailable = false;
    await doctor.save();
    await appointment.save();

    console.log('Appointment created:', appointment);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const { userId } = req.auth;
    console.log('Fetching appointments for clerkId:', userId);
    const patient = await Patient.findOne({ clerkId: userId });
    if (!patient) {
      console.log('No patient found for clerkId:', userId);
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get current date
    const currentDate = new Date();

    // Find and delete old cancelled appointments
    await Appointment.deleteMany({
      patientId: patient._id,
      status: 'cancelled',
      updatedAt: { $lt: new Date(currentDate - 24 * 60 * 60 * 1000) } // 24 hours old
    });

    // Fetch remaining appointments
    const appointments = await Appointment.find({ 
      patientId: patient._id,
      $or: [
        { status: { $ne: 'cancelled' } },
        { 
          status: 'cancelled',
          updatedAt: { $gte: new Date(currentDate - 24 * 60 * 60 * 1000) }
        }
      ]
    })
      .populate('doctorId', 'name speciality image')
      .sort({ date: -1 });

    console.log('Appointments fetched:', appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { userId } = req.auth;
    const patient = await Patient.findOne({ clerkId: userId });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    const slot = doctor.availableSlots.find(
      (s) => s.date.toISOString().split('T')[0] === appointment.date.toISOString().split('T')[0] && s.time === appointment.time
    );
    if (slot) {
      slot.isAvailable = true;
      await doctor.save();
    }

    appointment.status = 'cancelled';
    await appointment.save();

    console.log('Appointment cancelled:', appointment);
    res.status(200).json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to cancel appointment', error: error.message });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { appointmentId } = req.body;

    console.log('Creating Razorpay order for clerkId:', userId, 'appointmentId:', appointmentId);

    const appointment = await Appointment.findById(appointmentId).populate('doctorId', 'name fees');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const patient = await Patient.findOne({ clerkId: userId });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment not allowed for this appointment' });
    }

    const options = {
      amount: appointment.fees * 100, // Amount in paise
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId // Add this line to pass appointmentId in notes
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];

    const body = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ message: 'Webhook signature verification failed' });
    }

    const event = body.event;
    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;
      const order = await razorpay.orders.fetch(orderId);
      const appointmentId = order.notes.appointmentId;

      console.log('Processing payment for appointment:', appointmentId);

      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.status = 'paid';
        appointment.paymentId = payment.id;
        await appointment.save();
        console.log('Appointment marked as paid:', appointmentId);
      } else {
        console.error('Appointment not found:', appointmentId);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error.message, error.stack);
    res.status(500).json({ message: 'Webhook error', error: error.message });
  }
};