const AppError = require("../../custom_classes/AppError.custom_class");
const { PaymentLink, Service } = require("../../models");
const { syncRazorpayStatusForPaymentLink } = require("./sync.razorpay_status.payment_links.service");

const getPublicPaymentLinkService = async ({ token }) => {
    const paymentLink = await PaymentLink.findOne({
        where: { payment_link: `/pay/${token}` },
        include: [
            {
                model: Service,
                as: 'service',
            }
        ],
    });

    if (!paymentLink) throw new AppError('Payment link not found', 404);
    return syncRazorpayStatusForPaymentLink(paymentLink);
};

module.exports = getPublicPaymentLinkService;
