import nodemailer from 'nodemailer';

/**
 * Utility to send an email using Gmail SMTP.
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (!hasCredentials) {
      console.warn("[Email Config] Missing EMAIL_USER or EMAIL_PASS in backend/.env");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"BloodHub Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text, // Fallback to text if html is not provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email triggered for:", to);
    console.log("Email sent successfully");
    console.log(`[Email Sent Info] Info: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send to ${to}:`, error.message);
    // Don't throw, just log. We don't want the API to crash if email fails to send during testing.
    return false;
  }
};
