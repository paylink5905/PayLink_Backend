const express = require('express');
const {
    createPaymentLinkController,
    getPaymentLinkStatusController,
} = require('../controllers/razorpay.controller');

const router = express.Router();

router.post('/create-link', createPaymentLinkController);

router.post('/link-status', getPaymentLinkStatusController);

module.exports = router;
