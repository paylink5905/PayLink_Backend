const { PaymentLink, Service } = require("../../models");
const { syncRazorpayStatusForPaymentLinks } = require("./sync.razorpay_status.payment_links.service");

const getAllPaymentLinksService = async ({ userId }) => {
    const paymentLinks = await PaymentLink.findAll({
        include: [
            {
                model: Service,
                as: 'service',
                where: { user_id: userId },
            }
        ],
        order: [['created_at', 'DESC']],
    });

    return syncRazorpayStatusForPaymentLinks(paymentLinks);
};

module.exports = getAllPaymentLinksService;
