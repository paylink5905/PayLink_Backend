const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/email/send_email.email.utils.js");
const hashData = require("../../utils/otp/hash_otp.otp.utils.js");
const { Otp } = require("../../models");

const RESET_PASSWORD = "RESET_PASSWORD";

exports.sendOtpToEmail = async (otp, email) => {
  await sendEmail({
    to: email,
    subject: "Mpoket password reset OTP",
    text: `Your Mpoket password reset OTP is: ${otp}. It is valid for 10 minutes.`,
  });
};

exports.storeOtpInDb = async (otp, email, expiresAt, purpose = RESET_PASSWORD) => {

  const hashedOtp = await hashData(otp);

  await Otp.destroy({ where: { email, purpose } });

  await Otp.create({
    otp: hashedOtp,
    email: email,
    purpose,
    expires_at: expiresAt,
  });
};

exports.verifyOtp = async (otp, email, purpose = RESET_PASSWORD) => {
  try {
    if (!otp || typeof otp !== "string") {
      throw new Error("A valid OTP is required.");
    }

    const otpEntry = await Otp.findOne({ where: { email, purpose } });

    if (!otpEntry) {
      throw new Error("No OTP found. Please request a new one.");
    }

    if (Date.now() > new Date(otpEntry.expires_at).getTime()) {
      await Otp.destroy({ where : { email, purpose } });
      throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, otpEntry.otp);
    if (!isMatch) {
      throw new Error("Invalid OTP. Please try again.");
    }

    await Otp.destroy({ where: { email, purpose } });

    return {
      success: true,
      message: "OTP verified successfully.",
    };
  } catch (err) {
    console.error("Error in verifyOtp:", err.message);
    throw new Error(err.message || "OTP verification failed.");
  }
};
