const createPaymentLinkService = require('../services/payment_links/create.payment_links.service');
const getAllPaymentLinksService = require('../services/payment_links/get.all.payment_links.service');
const getPaymentLinkService = require('../services/payment_links/get.payment_links.service');
const getPublicPaymentLinkService = require('../services/payment_links/get.public.payment_links.service');

const normalizePaymentLinkResponse = (paymentLink) => {
    const data = typeof paymentLink.toJSON === 'function' ? paymentLink.toJSON() : paymentLink;
    const razorpayUrl = data.razorpay_short_url || data.short_url || null;
    const { payment_link, ...responseData } = data;

    return {
        ...responseData,
        razorpay_url: razorpayUrl,
        short_url: razorpayUrl,
        link_id: data.razorpay_link_id || data.link_id || null,
        razorpay_error: data.razorpay_error || null,
    };
};

exports.createPaymentLinkController = async (req, res, next) => {
    try {
        const { name, description, amount, tenure_months, phone, email, type, status } = req.body;
        const userId = req.user.id;
        const paymentLink = await createPaymentLinkService({
            name,
            description,
            amount,
            tenure_months,
            phone,
            email,
            type,
            status,
            userId
        });

        // Prepare response data with Razorpay fields included
        const responseData = normalizePaymentLinkResponse(paymentLink);

        res.status(201).json({
            success: true,
            message: 'Payment link generated successfully',
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllPaymentLinksController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const paymentLinks = await getAllPaymentLinksService({ userId });

        res.status(200).json({
            success: true,
            message: "Payment links retrieved successfully",
            data: paymentLinks.map(normalizePaymentLinkResponse)
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentLinkController = async (req, res, next) => {
    try {
        const { paymentLinkId } = req.params;
        const userId = req.user.id;
        const paymentLink = await getPaymentLinkService({ paymentLinkId, userId });

        res.status(200).json({
            success: true,
            message: "Payment link retrieved successfully",
            data: normalizePaymentLinkResponse(paymentLink)
        });
    } catch (error) {
        next(error);
    }
};

exports.getPublicPaymentLinkController = async (req, res, next) => {
    try {
        const { token } = req.params;
        const paymentLink = await getPublicPaymentLinkService({ token });

        res.status(200).json({
            success: true,
            message: "Payment link retrieved successfully",
            data: normalizePaymentLinkResponse(paymentLink)
        });
    } catch (error) {
        next(error);
    }
};
