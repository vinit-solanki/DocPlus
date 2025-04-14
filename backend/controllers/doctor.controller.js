const Doctor = require("../models/doctors.schema");
const Schedule = require("../models/schedules.schema");

exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
};

exports.updateDoctor = async (req, res) => {
  await Doctor.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Doctor updated successfully" });
};

exports.viewAppointments = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("schedules");
  res.json(doctor.schedules);
};

exports.approveAppointment = async (req, res) => {
  const schedule = await Schedule.findById(req.params.scheduleId);
  if (!schedule) return res.status(404).json({ message: "Appointment not found" });

  schedule.status = "Approved";
  await schedule.save();
  res.json({ message: "Appointment approved successfully" });
};

exports.cancelAppointment = async (req, res) => {
  const schedule = await Schedule.findById(req.params.scheduleId);
  if (!schedule) return res.status(404).json({ message: "Appointment not found" });

  schedule.status = "Cancelled";
  await schedule.save();
  res.json({ message: "Appointment cancelled successfully" });
};
