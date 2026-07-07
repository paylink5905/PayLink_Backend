const Razorpay = require('razorpay');
const AppError = require('../../custom_classes/AppError.custom_class');

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

module.exports = getRazorpayClient;
