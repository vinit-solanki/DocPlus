const Appointment = require("../models/Appointment")
const Doctor = require("../models/Doctor")
const Patient = require("../models/Patient")
const dotenv = require("dotenv")
dotenv.config()
const Razorpay = require("razorpay")
const crypto = require("crypto")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

exports.createAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const { doctorId, date, time, reason } = req.body

    console.log("Creating appointment for userId:", userId, "with data:", req.body)

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date, and time are required" })
    }

    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    // Find patient by user reference
    const patient = await Patient.findOne({ user: userId })
    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found. Please complete your profile first.",
        requiresProfile: true,
      })
    }

    // Check if slot is available
    const appointmentDate = new Date(date)
    const slot = doctor.availableSlots.find((s) => {
      const slotDate = new Date(s.date)
      return (
        slotDate.toISOString().split("T")[0] === appointmentDate.toISOString().split("T")[0] &&
        s.time === time &&
        s.isAvailable
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
      reason: reason || "",
      status: "pending",
    })

    // Mark slot as unavailable
    slot.isAvailable = false
    await doctor.save()
    await appointment.save()

    console.log("Appointment created successfully:", appointment._id)
    res.status(201).json({
      message: "Appointment created successfully",
      appointment: appointment,
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    res.status(500).json({ message: "Failed to create appointment", error: error.message })
  }
}

exports.getMyAppointments = async (req, res) => {
  try {
    const { userId } = req.user
    console.log("Fetching appointments for userId:", userId)

    const patient = await Patient.findOne({ user: userId })
    if (!patient) {
      console.log("No patient found for userId:", userId)
      return res.status(404).json({
        message: "Patient profile not found. Please create your profile first.",
        requiresProfile: true,
      })
    }

    // Get current date
    const currentDate = new Date()

    // Find and delete old cancelled appointments (older than 24 hours)
    await Appointment.deleteMany({
      patientId: patient._id,
      status: "cancelled",
      updatedAt: { $lt: new Date(currentDate - 24 * 60 * 60 * 1000) },
    })

    // Fetch remaining appointments
    const appointments = await Appointment.find({
      patientId: patient._id,
      $or: [
        { status: { $ne: "cancelled" } },
        {
          status: "cancelled",
          updatedAt: { $gte: new Date(currentDate - 24 * 60 * 60 * 1000) },
        },
      ],
    })
      .populate("doctorId", "name speciality image")
      .sort({ date: -1 })

    console.log("Appointments fetched:", appointments.length)
    res.status(200).json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message })
  }
}

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    const patient = await Patient.findOne({ user: userId })
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to cancel this appointment" })
    }

    // Make the slot available again
    const doctor = await Doctor.findById(appointment.doctorId)
    if (doctor) {
      const slot = doctor.availableSlots.find((s) => {
        const slotDate = new Date(s.date)
        const appointmentDate = new Date(appointment.date)
        return (
          slotDate.toISOString().split("T")[0] === appointmentDate.toISOString().split("T")[0] &&
          s.time === appointment.time
        )
      })
      if (slot) {
        slot.isAvailable = true
        await doctor.save()
      }
    }

    appointment.status = "cancelled"
    await appointment.save()

    console.log("Appointment cancelled:", appointment._id)
    res.status(200).json({ message: "Appointment cancelled successfully", appointment })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    res.status(500).json({ message: "Failed to cancel appointment", error: error.message })
  }
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.body

    console.log("Creating Razorpay order for userId:", userId, "appointmentId:", appointmentId)

    const appointment = await Appointment.findById(appointmentId).populate("doctorId", "name fees")
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    const patient = await Patient.findOne({ user: userId })
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Payment not allowed for this appointment" })
    }

    const options = {
      amount: appointment.fees * 100, // Amount in paise
      currency: "INR",
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
      },
    }

    const order = await razorpay.orders.create(options)
    console.log("Razorpay order created:", order.id)

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      appointmentId: appointmentId,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    res.status(500).json({ message: "Failed to create Razorpay order", error: error.message })
  }
}

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const receivedSignature = req.headers["x-razorpay-signature"]

    const body = req.body
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(body)).digest("hex")

    if (expectedSignature !== receivedSignature) {
      console.error("Webhook signature verification failed")
      return res.status(400).json({ message: "Webhook signature verification failed" })
    }

    const event = body.event
    if (event === "payment.captured") {
      const payment = body.payload.payment.entity
      const orderId = payment.order_id
      const order = await razorpay.orders.fetch(orderId)
      const appointmentId = order.notes.appointmentId

      console.log("Processing payment for appointment:", appointmentId)

      const appointment = await Appointment.findById(appointmentId)
      if (appointment) {
        appointment.status = "paid"
        appointment.paymentId = payment.id
        await appointment.save()
        console.log("Appointment marked as paid:", appointmentId)
      } else {
        console.error("Appointment not found:", appointmentId)
      }
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    res.status(500).json({ message: "Webhook error", error: error.message })
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId } = req.body
    const { userId } = req.user

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    // Find patient
    const patient = await Patient.findOne({ user: userId })
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" })
    }

    // Update appointment status
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, patientId: patient._id },
      { status: "paid", paymentId: razorpay_payment_id },
      { new: true },
    )

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    console.log("Payment verified for appointment:", appointmentId)
    res.json({ message: "Payment verified successfully", appointment })
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).json({ message: "Try refreshing the page or Please contact support.", error: error.message })
  }
}
