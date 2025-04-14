const express = require("express");
const { getDoctors, updateDoctor, viewAppointments, approveAppointment, cancelAppointment } = require("../controllers/doctorController");
const router = express.Router();

router.get("/", getDoctors);
router.put("/:id", updateDoctor);
router.get("/:id/appointments", viewAppointments);
router.put("/:id/approve/:scheduleId", approveAppointment);
router.put("/:id/cancel/:scheduleId", cancelAppointment);

module.exports = router;
