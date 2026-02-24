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

async function sendVerificationEmail(toEmail, token) {
  const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: toEmail,
    subject: 'Verify your email',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email. This link expires in 24 hours.</p>`,
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: toEmail,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };