import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const APP_NAME = 'Keyshien Accessories';
const PRIMARY_COLOR = '#ff6b8b'; // Gorgeous pastel pink

// Helper to send Verification Email
export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Verify Your Account - ${APP_NAME}`,
    html: `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background: #fff5f7;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${PRIMARY_COLOR}; margin: 0; font-size: 28px;">💖 ${APP_NAME} 💖</h1>
          <p style="color: #666; font-size: 14px;">Your Premium Accessories Destination</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #ffccd5; margin-bottom: 20px;">
        <div style="background: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Thank you for registering with us! We are thrilled to have you. To start exploring our collection of fine accessories, please verify your email address by clicking the link below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: ${PRIMARY_COLOR}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 10px rgba(255, 107, 139, 0.3); transition: all 0.3s ease;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${verifyUrl}" style="color: ${PRIMARY_COLOR};">${verifyUrl}</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 25px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Helper to send Password Reset Code Email
export const sendPasswordResetEmail = async (email, name, code) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Password Reset Verification Code - ${APP_NAME}`,
    html: `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background: #fff5f7;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${PRIMARY_COLOR}; margin: 0; font-size: 28px;">💖 ${APP_NAME} 💖</h1>
          <p style="color: #666; font-size: 14px;">Your Premium Accessories Destination</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #ffccd5; margin-bottom: 20px;">
        <div style="background: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <h2 style="color: #333; margin-top: 0;">Hello, ${name}</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. Please use the following 6-digit verification code to complete the process:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #fff5f7; border: 2px dashed ${PRIMARY_COLOR}; color: ${PRIMARY_COLOR}; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 30px; border-radius: 12px; display: inline-block; font-family: monospace;">
              ${code}
            </div>
          </div>
          <p style="color: #f75c7e; font-weight: bold; font-size: 13px; text-align: center;">
            Note: This verification code is valid for 10 minutes.
          </p>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
            If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        <div style="text-align: center; margin-top: 25px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;
