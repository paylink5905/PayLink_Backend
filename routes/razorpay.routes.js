const express = require('express');
const {
    createPaymentLinkController,
    getPaymentLinkStatusController,
} = require('../controllers/razorpay.controller');

const router = express.Router();

// Create Payment Link (shareable)
router.post('/create-link', createPaymentLinkController);

// Get Payment Link Status
router.post('/link-status', getPaymentLinkStatusController);

module.exports = router;
