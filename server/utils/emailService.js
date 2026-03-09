// Email service for sending password reset emails
const nodemailer = require('nodemailer');

// Create transporter using Gmail with explicit host configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // do not fail on invalid certs (sometimes required for free hosting platforms)
    rejectUnauthorized: false
  }
});

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - Reset token
 * @param {string} userName - User's name
 */
exports.sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://internship-placement-portal-kappa.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Hi ${userName},
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. If you didn't make this request, please ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; line-height: 1.6; margin-top: 20px;">
            Or copy and paste this link in your browser:
            <br/>
            <code style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px; word-break: break-all;">
              ${resetUrl}
            </code>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            © 2024 Internship Placement Portal. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Internship Placement Portal',
      html: htmlContent,
    };

    // Always log to console for debugging
    console.log('\n' + '='.repeat(60));
    console.log('📧 PASSWORD RESET EMAIL');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('-'.repeat(60));
    console.log(`Reset Link: ${resetUrl}`);
    console.log('-'.repeat(60));

    // Try to send email
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email successfully sent to ${email}\n`);
      return true;
    } catch (smtpError) {
      console.error(`❌ Error sending email via Gmail SMTP:`, smtpError.message);
      throw smtpError;
    }
  } catch (error) {
    console.error('❌ Error preparing password reset email:', error);
    throw error;
  }
};

/**
 * Send account confirmation email
 * @param {string} email - User's email
 * @param {string} userName - User's name
 */
exports.sendWelcomeEmail = async (email, userName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Internship Placement Portal!</h2>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Hi ${userName},
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Your account has been successfully created. You can now login to your dashboard and start exploring internship opportunities.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://internship-placement-portal-kappa.vercel.app'}/login" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Login
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            © 2024 Internship Placement Portal. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Internship Placement Portal',
      html: htmlContent,
    };

    // In development mode, log the email to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(60));
      console.log('📧 WELCOME EMAIL (Development Mode)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('-'.repeat(60));
      console.log(`Login URL: ${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://internship-placement-portal-kappa.vercel.app'}/login`);
      console.log('-'.repeat(60));
      console.log('(In production, this would be sent via email)\n');
    }

    // Try to send email, but don't fail if SMTP is unavailable
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email successfully sent to ${email}`);
    } catch (smtpError) {
      console.warn(`⚠️  Could not send email via SMTP: ${smtpError.message}`);
      console.log(`📌 Welcome email information available in console output above`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error preparing welcome email:', error);
    throw error;
  }
};
