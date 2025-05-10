const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.post('/', auth, appointmentController.createAppointment);
router.get('/my-appointments', auth, appointmentController.getMyAppointments);
router.put('/cancel/:id', auth, appointmentController.cancelAppointment);
router.post('/create-order', auth, appointmentController.createRazorpayOrder);
router.post('/webhook', express.raw({ type: 'application/json' }), appointmentController.handleWebhook);

module.exports = router;