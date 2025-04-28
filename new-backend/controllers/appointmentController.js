const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

    const appointments = await Appointment.find({ patientId: patient._id })
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

exports.createCheckoutSession = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { appointmentId } = req.body;

    console.log('Creating checkout session for clerkId:', userId, 'appointmentId:', appointmentId);

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment with ${appointment.doctorId.name}`,
              description: `Date: ${appointment.date.toLocaleDateString()}, Time: ${appointment.time}`,
            },
            unit_amount: appointment.fees * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/my-appointments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/my-appointments`,
      metadata: {
        appointmentId: appointmentId,
        patientId: patient._id.toString(),
      },
    });

    console.log('Checkout session created:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ message: 'Webhook error', error: err.message });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata.appointmentId;

      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.status = 'paid';
        appointment.paymentId = session.payment_intent;
        await appointment.save();
        console.log('Appointment marked as paid:', appointmentId);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error.message, error.stack);
    res.status(500).json({ message: 'Webhook error', error: error.message });
  }
};