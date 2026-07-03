const Razorpay = require('razorpay');
const AppError = require('../../custom_classes/AppError.custom_class');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentLinkService = async ({ amount, currency, receipt, description, customer_name, customer_email, customer_phone }) => {
    if (amount < 100) {
        throw new AppError('Minimum amount is 100 paise (1 INR)', 400);
    }

    try {
        const options = {
            amount: amount, // in paise
            currency: currency || 'INR',
            accept_partial: false,
            description: description || 'Payment via PayLink',
            customer_notify: 1,
        };

        if (customer_name || customer_email || customer_phone) {
            const customer = {};
            if (customer_name) customer.name = customer_name;
            if (customer_email) customer.email = customer_email;
            if (customer_phone) customer.contact = customer_phone;
            options.customer = customer;
        }

        if (receipt) {
            options.reference_id = receipt;
        }

        const paymentLink = await razorpay.invoices.create({
            ...options,
            type: 'link'
        });

        if (!paymentLink || !paymentLink.id) {
            throw new AppError('Failed to create payment link', 500);
        }

        return {
            link_id: paymentLink.id,
            short_url: paymentLink.short_url || paymentLink.url,
            payment_link: paymentLink.url,
            amount: paymentLink.amount,
            currency: paymentLink.currency,
            status: paymentLink.status,
        };
    } catch (error) {
        console.error('Payment Link Error:', error.message);
        if (error instanceof AppError) {
            throw error;
        }
        if (error.statusCode) {
            throw new AppError(error.message, error.statusCode);
        }
        throw new AppError('Failed to create payment link: ' + (error.message || 'Unknown error'), 500);
    }
};

module.exports = createPaymentLinkService;
