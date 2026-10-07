import nodemailer from 'nodemailer';

/**
 * Create a reusable transporter using Gmail SMTP
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * Send student verification OTP email
 * @param {string} toEmail - Recipient college email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User's display name
 */
export const sendVerificationEmail = async (toEmail, otp, userName = 'Student') => {
  const transporter = createTransporter();

  if (!transporter) {
    // Return false so caller knows email wasn't sent (OTP still returned in dev mode)
    return false;
  }

  const mailOptions = {
    from: `"CampusGig 🎓" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your CampusGig Student Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; margin: 0;">🎓 CampusGig</h1>
          <p style="color: #64748b; margin: 4px 0 0;">Student Verification</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 16px; color: #334155;">Hi <strong>${userName}</strong>,</p>
          <p style="margin: 0 0 24px; color: #475569; line-height: 1.6;">
            Here is your 6-digit verification code to confirm your student status on CampusGig:
          </p>

          <div style="text-align: center; background: #eef2ff; border-radius: 10px; padding: 20px; margin: 0 0 24px; border: 2px dashed #818cf8;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #4338ca; font-family: monospace;">${otp}</span>
          </div>

          <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
            ⏱️ This code is valid for <strong>15 minutes</strong>.
          </p>
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>

        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
          © ${new Date().getFullYear()} CampusGig — Connecting Campus Talent
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
};
