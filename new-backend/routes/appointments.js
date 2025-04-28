const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, appointmentController.createAppointment);
router.get('/my-appointments', requireAuth, appointmentController.getMyAppointments);
router.put('/cancel/:id', requireAuth, appointmentController.cancelAppointment);
router.post('/checkout', requireAuth, appointmentController.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), appointmentController.handleWebhook);

module.exports = router;