const AppError = require("../../custom_classes/AppError.custom_class");
const { PaymentLink, Service } = require("../../models");
const { syncRazorpayStatusForPaymentLink } = require("./sync.razorpay_status.payment_links.service");

const getPaymentLinkService = async ({ paymentLinkId, userId }) => {
    const paymentLink = await PaymentLink.findOne({
        where: { id: paymentLinkId },
        include: [
            {
                model: Service,
                as: 'service',
                where: { user_id: userId },
            }
        ],
    });

    if (!paymentLink) throw new AppError('Payment link not found', 404);
    return syncRazorpayStatusForPaymentLink(paymentLink);
};

module.exports = getPaymentLinkService;
