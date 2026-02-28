import dotenv from 'dotenv';

import transporter from '../config/nodemailer.js';

export async function sendMail({ to, subject, text, html }) {
    const fromAddr = process.env.SENDER_EMAIL;
    try {
        const mailOptions = await transporter.sendMail({
            from: fromAddr,
            to,
            subject,
            text,
            html,
        });
        return mailOptions;
    } catch (err) {
        console.error('mailService.sendMail error: ', err);
        throw err;
    }
}

export async function sendVerificationOtp(to, name, code) {
    const subject = `Verify your account.`;
    const text = `Your verification code is: ${code} (expires in 30 minutes).`;
    const html = `
    <p>Hi ${name || ''},</p>
    <p>Your verification code is:</p>
    <p style="font-size:20px;"><strong>${code}</strong></p>
    <p>This code will expire in 30 minutes. If you did not request this, ignore this email.</p>`;
  return sendMail({ to, subject, text, html });
}

export async function sendResetEmail(to, name, code) {
  const subject = `Password rest code`;
  const text = `Your password reset code is: ${code} (expires in 1 hour).`;
  const html = `
    <p>Hi ${name || ''},</p>
    <p>Your password reset code is:</p>
    <p style="font-size:20px;"><strong>${code}</strong></p>
    <p>This code will expire in 1 hour. If you did not request this, ignore this email.</p>
  `;
  return sendMail({ to, subject, text, html });
}