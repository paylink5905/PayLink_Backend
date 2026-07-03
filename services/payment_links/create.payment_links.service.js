const crypto = require('crypto');
const Razorpay = require('razorpay');
const AppError = require("../../custom_classes/AppError.custom_class");
const { PaymentLink, Service } = require("../../models");

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentLinkService = async ({
    name,
    description,
    amount,
    phone,
    email,
    type,
    tenure_months,
    status,
    userId,
}) => {
    const service = await Service.create({
        name,
        description,
        amount,
        phone,
        type,
        tenure_months: type === 'LOAN' ? tenure_months : null,
        status,
        user_id: userId
    });

    if (!service) throw new AppError('Failed to create service', 500);

    const token = crypto.randomBytes(18).toString('hex');
    const paymentLink = await PaymentLink.create({
        payment_link: `/pay/${token}`,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: status === 'PAID' ? 'PAID' : 'PENDING',
        service_id: service.id,
    });

    if (!paymentLink) throw new AppError('Failed to create payment link', 500);

    // Create Razorpay payment link only if not already created
    let razorpayError = null;

    if (!paymentLink.razorpay_link_id) {
        let razorpayPayload = null;

        try {
            const customerPayload = {
                name,
                ...(email ? { email } : {}),
            };

            const phoneDigits = String(phone || '').replace(/\D+/g, '');
            if (phoneDigits) {
                customerPayload.contact = phoneDigits;
            }

            const referenceId = String(paymentLink.payment_link || `paylink_${paymentLink.id}`);
            razorpayPayload = {
                amount: Math.round(Number(amount) * 100), // Convert to paise
                currency: 'INR',
                description: description || `Payment for ${name}`,
                reference_id: referenceId.slice(0, 40),
                customer: customerPayload
            };

            const razorpayResponse = await razorpay.paymentLink.create(razorpayPayload);
            const shortUrl = razorpayResponse.short_url || razorpayResponse.url || null;

            await paymentLink.update({
                razorpay_link_id: razorpayResponse.id,
                razorpay_short_url: shortUrl,
                razorpay_status: razorpayResponse.status
            });
        } catch (error) {
            let razorpayErrorMessage = 'Razorpay payment link creation failed';

            if (error instanceof Error) {
                razorpayErrorMessage = error.message || razorpayErrorMessage;
            } else if (typeof error === 'string') {
                razorpayErrorMessage = error;
            } else if (error && typeof error === 'object') {
                razorpayErrorMessage = error.description || error.error?.description || error.message || razorpayErrorMessage;
            }

            razorpayError = razorpayErrorMessage;
            console.error('Razorpay creation error', {
                paymentLinkId: paymentLink.id,
                payload: razorpayPayload,
                error: razorpayErrorMessage
            });
            await paymentLink.update({ razorpay_error: razorpayError });
        }
    }

    // Refresh the payment link to get all updates
    await paymentLink.reload();

    return {
        ...paymentLink.toJSON(),
        service,
    };
};

module.exports = createPaymentLinkService;
