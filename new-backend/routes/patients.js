const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const patientController = require('../controllers/patientController');

router.get('/', requireAuth, patientController.getPatient);
router.put('/', requireAuth, patientController.updatePatient);

module.exports = router;