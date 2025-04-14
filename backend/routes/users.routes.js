const express = require('express');
const router = express.Router();
const { updateUserMetadata } = require('../controllers/user.controller.js');
const { authenticate } = require('../middleware/auth.js');

router.post('/update-metadata', updateUserMetadata);

module.exports = router;