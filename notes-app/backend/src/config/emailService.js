const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"Noted App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your Noted password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px;">Reset your password</h2>
          <p style="font-size: 14px; color: #6b6b6b; margin: 0;">Hi ${name}, here's your one-time password reset code.</p>
        </div>
        <div style="background: #f7f7f5; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #999; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Your OTP code</p>
          <p style="font-size: 36px; font-weight: 600; color: #1a1a1a; letter-spacing: 8px; margin: 0;">${otp}</p>
        </div>
        <p style="font-size: 13px; color: #999; margin: 0;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send OTP email: ${error.message}`);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendOTPEmail };
