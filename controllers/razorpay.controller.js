const createPaymentLinkService = require('../services/razorpay/create.razorpay.order.service');
const getPaymentLinkStatusService = require('../services/razorpay/verify.razorpay.payment.service');

exports.createPaymentLinkController = async (req, res) => {
    const { amount, currency, receipt, description, customer_name, customer_email, customer_phone } = req.body;

    const paymentLink = await createPaymentLinkService({
        amount,
        currency,
        receipt,
        description,
        customer_name,
        customer_email,
        customer_phone,
    });

    res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        data: paymentLink,
    });
};

exports.getPaymentLinkStatusController = async (req, res) => {
    const { link_id } = req.body;

    const status = await getPaymentLinkStatusService({ link_id });

    res.status(200).json({
        success: true,
        message: 'Payment link status retrieved',
        data: status,
    });
};
