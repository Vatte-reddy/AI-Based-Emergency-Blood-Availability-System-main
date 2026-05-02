import express from 'express';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/test-email', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "email query parameter is required (e.g., /api/test-email?email=test@gmail.com)" });
  }

  try {
    const isConfigured = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
    
    if (!isConfigured) {
      return res.status(500).json({ 
        success: false, 
        message: "Server missing Nodemailer credentials entirely. Check backend/.env file.", 
        emailConfigStatus: false
      });
    }

    const success = await sendEmail(
      email,
      "BloodHub Test Email",
      "This is a test email sent from the BloodHub backend. Your Nodemailer configuration is working successfully!"
    );

    if (success) {
      res.json({ 
        success: true,
        message: `Test email dispatched to ${email}`,
        emailConfigStatus: true
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "Failed to send email. Nodemailer logged an error (Likely incorrect Google App Password).",
        emailConfigStatus: true
      });
    }
  } catch (error) {
    console.error("Test email route error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during email test", 
      emailConfigStatus: !!process.env.EMAIL_USER,
      error: error.message 
    });
  }
});

export default router;
