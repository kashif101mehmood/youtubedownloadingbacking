const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_URL = process.env.APP_URL || 'https://kashifuet--kashifuet.replit.app'; // fallback for local

async function sendVerificationEmail(toEmail, token) {
  const verificationLink = `${APP_URL}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"KMS Downloader" <noreply@yourapp.com>',
    to: toEmail,
    subject: 'Verify your email',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email. This link expires in 24 hours.</p>`,
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: '"KMS Downloader" <noreply@yourapp.com>',
    to: toEmail,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };