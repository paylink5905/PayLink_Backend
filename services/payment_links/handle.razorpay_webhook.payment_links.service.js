const AppError = require("../../custom_classes/AppError.custom_class");
const { PaymentLink, Service } = require("../../models");

const eventStatusMap = {
    'payment_link.paid': {
        paymentLinkStatus: 'PAID',
        serviceStatus: 'PAID',
        razorpayStatus: 'paid',
    },
    'payment_link.cancelled': {
        paymentLinkStatus: 'CANCELLED',
        serviceStatus: 'CANCELLED',
        razorpayStatus: 'cancelled',
    },
    'payment_link.expired': {
        paymentLinkStatus: 'EXPIRED',
        serviceStatus: 'EXPIRED',
        razorpayStatus: 'expired',
    },
};

const getPaymentLinkEntity = (payload) => payload?.payload?.payment_link?.entity || null;

const handleRazorpayWebhookPaymentLinkService = async ({ payload, eventId }) => {
    const eventName = payload?.event;
    const statusUpdate = eventStatusMap[eventName];

    if (!statusUpdate) {
        return {
            processed: false,
            reason: 'ignored_event',
            event: eventName || null,
            eventId: eventId || null,
        };
    }

    const razorpayPaymentLink = getPaymentLinkEntity(payload);
    const razorpayLinkId = razorpayPaymentLink?.id;

    if (!razorpayLinkId) {
        throw new AppError('Razorpay payment link id missing in webhook payload', 400);
    }

    const paymentLink = await PaymentLink.findOne({
        where: { razorpay_link_id: razorpayLinkId },
        include: [{ model: Service, as: 'service' }],
    });

    if (!paymentLink) {
        return {
            processed: false,
            reason: 'payment_link_not_found',
            event: eventName,
            eventId: eventId || null,
            razorpayLinkId,
        };
    }

    if (paymentLink.status === 'PAID' && statusUpdate.paymentLinkStatus !== 'PAID') {
        return {
            processed: false,
            reason: 'paid_status_preserved',
            event: eventName,
            eventId: eventId || null,
            paymentLinkId: paymentLink.id,
            razorpayLinkId,
        };
    }

    await paymentLink.update({
        status: statusUpdate.paymentLinkStatus,
        razorpay_status: razorpayPaymentLink.status || statusUpdate.razorpayStatus,
        razorpay_short_url: razorpayPaymentLink.short_url || paymentLink.razorpay_short_url,
        razorpay_error: null,
    });

    if (paymentLink.service) {
        await paymentLink.service.update({ status: statusUpdate.serviceStatus });
    }

    return {
        processed: true,
        event: eventName,
        eventId: eventId || null,
        paymentLinkId: paymentLink.id,
        razorpayLinkId,
        status: statusUpdate.paymentLinkStatus,
    };
};

module.exports = handleRazorpayWebhookPaymentLinkService;
