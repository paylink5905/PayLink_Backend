const AppError = require("../../custom_classes/AppError.custom_class");
const getRazorpayClient = require("../razorpay/get.razorpay.client.service");

const statusMap = {
    paid: {
        paymentLinkStatus: 'PAID',
        serviceStatus: 'PAID',
    },
    cancelled: {
        paymentLinkStatus: 'CANCELLED',
        serviceStatus: 'UNPAID',
    },
    canceled: {
        paymentLinkStatus: 'CANCELLED',
        serviceStatus: 'UNPAID',
    },
    expired: {
        paymentLinkStatus: 'EXPIRED',
        serviceStatus: 'UNPAID',
    },
};

const getRazorpayStatusUpdate = (razorpayPaymentLink) => {
    const rawStatus = String(razorpayPaymentLink?.status || '').toLowerCase();
    return statusMap[rawStatus] || {
        paymentLinkStatus: 'PENDING',
        serviceStatus: 'UNPAID',
    };
};

const fetchRazorpayPaymentLink = async (razorpayLinkId) => {
    const client = getRazorpayClient();

    if (!client.paymentLink?.fetch) {
        throw new AppError('Razorpay payment link fetch is not available', 500);
    }

    return client.paymentLink.fetch(razorpayLinkId);
};

const syncRazorpayStatusForPaymentLink = async (paymentLink) => {
    if (!paymentLink?.razorpay_link_id) return paymentLink;
    if (paymentLink.status === 'PAID') return paymentLink;

    try {
        const razorpayPaymentLink = await fetchRazorpayPaymentLink(paymentLink.razorpay_link_id);
        const statusUpdate = getRazorpayStatusUpdate(razorpayPaymentLink);

        if (paymentLink.status === 'PAID' && statusUpdate.paymentLinkStatus !== 'PAID') {
            return paymentLink;
        }

        const nextRazorpayStatus = razorpayPaymentLink.status || paymentLink.razorpay_status;
        const nextShortUrl = razorpayPaymentLink.short_url || razorpayPaymentLink.url || paymentLink.razorpay_short_url;
        const shouldUpdatePaymentLink =
            paymentLink.status !== statusUpdate.paymentLinkStatus ||
            paymentLink.razorpay_status !== nextRazorpayStatus ||
            paymentLink.razorpay_short_url !== nextShortUrl ||
            paymentLink.razorpay_error;

        if (shouldUpdatePaymentLink) {
            await paymentLink.update({
                status: statusUpdate.paymentLinkStatus,
                razorpay_status: nextRazorpayStatus,
                razorpay_short_url: nextShortUrl,
                razorpay_error: null,
            });
        } else {
            paymentLink.status = statusUpdate.paymentLinkStatus;
            paymentLink.razorpay_status = nextRazorpayStatus;
            paymentLink.razorpay_short_url = nextShortUrl;
            paymentLink.razorpay_error = null;
        }

        if (paymentLink.service && paymentLink.service.status !== statusUpdate.serviceStatus) {
            await paymentLink.service.update({ status: statusUpdate.serviceStatus });
            paymentLink.service.status = statusUpdate.serviceStatus;
        }

        return paymentLink;
    } catch (error) {
        const message = error instanceof AppError
            ? error.message
            : error?.description || error?.error?.description || error?.message || 'Failed to sync Razorpay status';

        console.error('Razorpay status sync failed', {
            paymentLinkId: paymentLink.id,
            razorpayLinkId: paymentLink.razorpay_link_id,
            error: message,
        });

        return paymentLink;
    }
};

const syncRazorpayStatusForPaymentLinks = async (paymentLinks = []) => {
    const syncableLinks = paymentLinks.filter((paymentLink) => paymentLink?.razorpay_link_id && paymentLink.status !== 'PAID');
    const batchSize = 5;

    for (let index = 0; index < syncableLinks.length; index += batchSize) {
        const batch = syncableLinks.slice(index, index + batchSize);
        await Promise.all(batch.map(syncRazorpayStatusForPaymentLink));
    }

    return paymentLinks;
};

module.exports = {
    syncRazorpayStatusForPaymentLink,
    syncRazorpayStatusForPaymentLinks,
};
