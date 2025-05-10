const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const patientController = require('../controllers/patientController');

router.get('/', auth, patientController.getPatient);
router.put('/', auth, patientController.updatePatient);

module.exports = router;