const AppError = require("../../custom_classes/AppError.custom_class");
const getRazorpayClient = require("../razorpay/get.razorpay.client.service");

const statusMap = {
    paid: {
        paymentLinkStatus: 'PAID',
        serviceStatus: 'PAID',
    },
    cancelled: {
        paymentLinkStatus: 'CANCELLED',
        serviceStatus: 'CANCELLED',
    },
    canceled: {
        paymentLinkStatus: 'CANCELLED',
        serviceStatus: 'CANCELLED',
    },
    expired: {
        paymentLinkStatus: 'EXPIRED',
        serviceStatus: 'EXPIRED',
    },
};

const getRazorpayStatusUpdate = (razorpayPaymentLink) => {
    const rawStatus = String(razorpayPaymentLink?.status || '').toLowerCase();
    return statusMap[rawStatus] || {
        paymentLinkStatus: 'PENDING',
        serviceStatus: 'PENDING',
    };
};

const isLocallyExpired = (paymentLink) => {
    if (!paymentLink?.expiry_date) return false;
    return new Date(paymentLink.expiry_date).getTime() <= Date.now();
};

const getLocalExpiryStatusUpdate = (paymentLink) => {
    if (!isLocallyExpired(paymentLink)) return null;

    return {
        paymentLinkStatus: 'EXPIRED',
        serviceStatus: 'EXPIRED',
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
    if (!paymentLink?.razorpay_link_id && !isLocallyExpired(paymentLink)) return paymentLink;
    if (paymentLink.status === 'PAID') return paymentLink;

    try {
        const razorpayPaymentLink = paymentLink.razorpay_link_id
            ? await fetchRazorpayPaymentLink(paymentLink.razorpay_link_id)
            : null;
        const razorpayStatusUpdate = getRazorpayStatusUpdate(razorpayPaymentLink);
        const statusUpdate = razorpayStatusUpdate.paymentLinkStatus === 'PENDING'
            ? getLocalExpiryStatusUpdate(paymentLink) || razorpayStatusUpdate
            : razorpayStatusUpdate;

        if (paymentLink.status === 'PAID' && statusUpdate.paymentLinkStatus !== 'PAID') {
            return paymentLink;
        }

        const nextRazorpayStatus = razorpayPaymentLink?.status || paymentLink.razorpay_status;
        const nextShortUrl = razorpayPaymentLink?.short_url || razorpayPaymentLink?.url || paymentLink.razorpay_short_url;
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

        const localExpiryStatusUpdate = getLocalExpiryStatusUpdate(paymentLink);
        if (localExpiryStatusUpdate) {
            await paymentLink.update({
                status: localExpiryStatusUpdate.paymentLinkStatus,
                razorpay_status: paymentLink.razorpay_status,
                razorpay_short_url: paymentLink.razorpay_short_url,
                razorpay_error: message,
            });

            if (paymentLink.service && paymentLink.service.status !== localExpiryStatusUpdate.serviceStatus) {
                await paymentLink.service.update({ status: localExpiryStatusUpdate.serviceStatus });
                paymentLink.service.status = localExpiryStatusUpdate.serviceStatus;
            }
        }

        return paymentLink;
    }
};

const syncRazorpayStatusForPaymentLinks = async (paymentLinks = []) => {
    const syncableLinks = paymentLinks.filter((paymentLink) => (
        paymentLink?.status !== 'PAID' &&
        (paymentLink.razorpay_link_id || isLocallyExpired(paymentLink))
    ));
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
