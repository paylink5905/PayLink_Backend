const crypto = require('crypto');
const Razorpay = require('razorpay');
const AppError = require("../../custom_classes/AppError.custom_class");
const { PaymentLink, Service } = require("../../models");

let razorpay = null;

const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new AppError('Razorpay credentials are not configured', 500);
    }

    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }

    return razorpay;
};

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
    const serviceName = name || null;
    const serviceDescription = description || null;
    const servicePhone = phone || null;
    const serviceEmail = email || null;
    const serviceType = type || 'ONE_TIME';
    const serviceStatus = status || 'UNPAID';

    const service = await Service.create({
        name: serviceName,
        description: serviceDescription,
        amount,
        phone: servicePhone,
        email: serviceEmail,
        type: serviceType,
        tenure_months: serviceType === 'LOAN' ? tenure_months || null : null,
        status: serviceStatus,
        user_id: userId
    });

    if (!service) throw new AppError('Failed to create service', 500);

    const token = crypto.randomBytes(18).toString('hex');
    const paymentLink = await PaymentLink.create({
        payment_link: `/pay/${token}`,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: serviceStatus === 'PAID' ? 'PAID' : 'PENDING',
        service_id: service.id,
    });

    if (!paymentLink) throw new AppError('Failed to create payment link', 500);

    let razorpayError = null;

    if (!paymentLink.razorpay_link_id) {
        let razorpayPayload = null;

        try {
            const customerPayload = {
                name: serviceName || 'Customer',
                ...(serviceEmail ? { email: serviceEmail } : {}),
            };

            const phoneDigits = String(servicePhone || '').replace(/\D+/g, '');
            if (phoneDigits) {
                customerPayload.contact = phoneDigits;
            }

            const referenceId = String(paymentLink.payment_link || `mpoket_${paymentLink.id}`);
            razorpayPayload = {
                amount: Math.round(Number(amount) * 100), // Convert to paise
                currency: 'INR',
                description: serviceDescription || `Payment request for Rs. ${Number(amount).toLocaleString('en-IN')}`,
                reference_id: referenceId.slice(0, 40),
                customer: customerPayload
            };

            const razorpayResponse = await getRazorpayClient().paymentLink.create(razorpayPayload);
            const shortUrl = razorpayResponse.short_url || razorpayResponse.url || null;
            if (!shortUrl) {
                throw new AppError('Razorpay did not return a payment URL', 502);
            }

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
            throw new AppError(razorpayError, 502);
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
