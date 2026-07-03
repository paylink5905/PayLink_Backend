const Razorpay = require('razorpay');
const AppError = require('../../custom_classes/AppError.custom_class');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getPaymentLinkStatusService = async ({ link_id }) => {
    if (!link_id) {
        throw new AppError('Payment link ID is required', 400);
    }

    try {
        const invoice = await razorpay.invoices.fetch(link_id);

        if (!invoice) {
            throw new AppError('Payment link not found', 404);
        }

        const statusMap = {
            'issued': 'issued',
            'paid': 'paid',
            'expired': 'expired',
            'cancelled': 'cancelled',
            'draft': 'created'
        };

        return {
            link_id: invoice.id,
            short_url: invoice.short_url || invoice.url,
            amount: invoice.amount,
            currency: invoice.currency,
            status: statusMap[invoice.status] || invoice.status,
            created_at: invoice.created_at,
            payments: invoice.payments && invoice.payments.length > 0 ? {
                payment_id: invoice.payments[0].id,
                amount: invoice.payments[0].amount,
                status: 'captured'
            } : null,
        };
    } catch (error) {
        console.error('Payment Link Status Error:', error.message);
        if (error instanceof AppError) {
            throw error;
        }
        if (error.statusCode === 404) {
            throw new AppError('Payment link not found', 404);
        }
        if (error.statusCode) {
            throw new AppError(error.message, error.statusCode);
        }
        throw new AppError('Failed to fetch payment link status', 500);
    }
};

module.exports = getPaymentLinkStatusService;
