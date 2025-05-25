const express = require("express")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const Appointment = require("../models/Appointment")
const Patient = require("../models/Patient")
const Doctor = require("../models/Doctor")
const auth = require("../middleware/auth")

const router = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "your_razorpay_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_razorpay_key_secret",
})

// IMPORTANT: Specific routes MUST come before parameterized routes
// Get user's appointments - MUST be before /:id route
router.get("/my-appointments", auth, async (req, res) => {
  try {
    console.log("Fetching appointments for user:", req.user._id)

    const patient = await Patient.findOne({ user: req.user._id })
    if (!patient) {
      console.log("Patient profile not found for user:", req.user._id)
      return res.status(404).json({ message: "Patient profile not found" })
    }

    console.log("Found patient:", patient._id)

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name speciality image degree experience fees")
      .populate("patientId", "name email phone")
      .sort({ date: -1 })

    console.log("Found appointments:", appointments.length)

    // Filter out appointments with null doctorId (in case doctor was deleted)
    const validAppointments = appointments.filter((appointment) => appointment.doctorId !== null)

    res.json(validAppointments)
  } catch (error) {
    console.error("Get appointments error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create Razorpay order - MUST be before /:id route
router.post("/create-order", auth, async (req, res) => {
  try {
    const { appointmentId } = req.body

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Verify ownership
    const patient = await Patient.findOne({ user: req.user._id })
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Appointment is not in pending status" })
    }

    const options = {
      amount: appointment.fees * 100, // amount in paise
      currency: "INR",
      receipt: `appointment_${appointmentId}`,
    }

    const order = await razorpay.orders.create(options)

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || "your_razorpay_key_id",
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Verify payment - MUST be before /:id route
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId } = req.body

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "your_razorpay_key_secret")
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    // Update appointment
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    appointment.status = "paid"
    appointment.paymentId = razorpay_payment_id
    await appointment.save()

    res.json({ message: "Payment verified successfully" })
  } catch (error) {
    console.error("Verify payment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create appointment
router.post("/", auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body

    console.log("Creating appointment:", { doctorId, date, time, reason })

    // Find patient profile
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(400).json({
        message: "Patient profile not found. Please complete your profile first.",
        requiresProfile: true,
      });
    }

    // Find doctor and get fees
    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    // Check if slot is available
    const appointmentDate = new Date(date)
    const slot = doctor.availableSlots.find((slot) => {
      const slotDate = new Date(slot.date)
      return (
        slotDate.toISOString().split("T")[0] === appointmentDate.toISOString().split("T")[0] &&
        slot.time === time &&
        slot.isAvailable
      )
    })

    if (!slot) {
      return res.status(400).json({ message: "Selected time slot is not available" })
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      date: appointmentDate,
      time,
      fees: doctor.fees,
      reason,
      status: "pending",
    })

    await appointment.save()

    // Mark slot as unavailable
    slot.isAvailable = false
    await doctor.save()

    // Populate the appointment before sending response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("doctorId", "name speciality image degree experience fees")
      .populate("patientId", "name email phone")

    console.log("Appointment created successfully:", populatedAppointment._id)

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    })
  } catch (error) {
    console.error("Create appointment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel appointment - MUST be before /:id route
router.put("/cancel/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Verify ownership
    const patient = await Patient.findOne({ user: req.user._id })
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Appointment already cancelled" })
    }

    // Update appointment status
    appointment.status = "cancelled"
    await appointment.save()

    // Make slot available again
    const doctor = await Doctor.findById(appointment.doctorId)
    if (doctor) {
      const slot = doctor.availableSlots.find(
        (slot) =>
          slot.date.toISOString().split("T")[0] === appointment.date.toISOString().split("T")[0] &&
          slot.time === appointment.time,
      )
      if (slot) {
        slot.isAvailable = true
        await doctor.save()
      }
    }

    res.json({ message: "Appointment cancelled successfully" })
  } catch (error) {
    console.error("Cancel appointment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all appointments (admin)
router.get("/", auth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name speciality")
      .populate("patientId", "name email")
      .sort({ date: -1 })
    res.json(appointments)
  } catch (error) {
    console.error("Get all appointments error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get appointment by ID - MUST be LAST among GET routes
router.get("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name speciality image degree experience fees")
      .populate("patientId", "name email phone")

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    res.json(appointment)
  } catch (error) {
    console.error("Get appointment error:", error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Appointment not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Update appointment - MUST be after specific PUT routes
router.put("/:id", auth, async (req, res) => {
  const { doctorId, date, time, reason } = req.body

  try {
    let appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check user authorization
    const patient = await Patient.findOne({ user: req.user._id })
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Build appointment object
    const appointmentFields = {}
    if (doctorId) appointmentFields.doctorId = doctorId
    if (date) appointmentFields.date = date
    if (time) appointmentFields.time = time
    if (reason) appointmentFields.reason = reason

    appointment = await Appointment.findByIdAndUpdate(req.params.id, { $set: appointmentFields }, { new: true })
      .populate("doctorId", "name speciality image degree experience fees")
      .populate("patientId", "name email phone")

    res.json(appointment)
  } catch (error) {
    console.error("Update appointment error:", error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Appointment not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Delete appointment - MUST be after specific DELETE routes
router.delete("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check user authorization
    const patient = await Patient.findOne({ user: req.user._id })
    if (!patient || !appointment.patientId.equals(patient._id)) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await Appointment.findByIdAndDelete(req.params.id)

    res.json({ message: "Appointment removed" })
  } catch (error) {
    console.error("Delete appointment error:", error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Appointment not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
