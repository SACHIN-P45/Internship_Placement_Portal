// Email service — password reset, welcome, and application status notifications
// Rewritten to proxy requests to Vercel Serverless Function since Render blocks outbound SMTP

/**
 * Send email via Vercel proxy
 */
const sendMailViaProxy = async (to, subject, htmlContent) => {
  const proxyUrl = 'https://internship-placement-portal-kappa.vercel.app/api/sendmail';

  const payload = {
    to,
    subject,
    htmlContent,
    creds: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
      // Use env var so the secret can be rotated without touching source code
      secret: process.env.EMAIL_PROXY_SECRET || 'super-secure-portal-secret-key-123'
    }
  };

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Error from email proxy');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Vercel SMTP Proxy Failed: ' + error.message);
  }
};

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
            &copy; ${new Date().getFullYear()} Internship Placement Portal. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const subject = 'Password Reset Request - Internship Placement Portal';

    // Log for debugging
    console.log('\n' + '='.repeat(60));
    console.log('📧 PASSWORD RESET EMAIL');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(60));
    console.log(`Reset Link: ${resetUrl}`);
    console.log('-'.repeat(60));

    // Try to send email via Vercel Proxy
    try {
      await sendMailViaProxy(email, subject, htmlContent);
      console.log(`✅ Password reset email proxy successfully dispatched to ${email}\n`);
      return true;
    } catch (proxyError) {
      console.error(`❌ Error triggering Vercel Email Proxy:`, proxyError.message);
      throw proxyError;
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
    const loginUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://internship-placement-portal-kappa.vercel.app'}/login`;

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
            <a href="${loginUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Login
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Internship Placement Portal. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const subject = 'Welcome to Internship Placement Portal';

    // In development mode, log the email to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(60));
      console.log('📧 WELCOME EMAIL (Development Mode)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log('-'.repeat(60));
      console.log(`Login URL: ${loginUrl}`);
      console.log('-'.repeat(60));
      console.log('(In production, this would be sent via email)\n');
    }

    // Try to send email, but don't fail if proxy is unavailable
    try {
      await sendMailViaProxy(email, subject, htmlContent);
      console.log(`✅ Welcome email proxy successfully dispatched to ${email}`);
    } catch (proxyError) {
      console.warn(`⚠️  Could not trigger Vercel Email Proxy: ${proxyError.message}`);
      console.log(`📌 Welcome email information available in console output above`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error preparing welcome email:', error);
    throw error;
  }
};

/**
 * Send application status change email to student
 * @param {string} email        - Student's email address
 * @param {string} studentName  - Student's name
 * @param {string} jobTitle     - Title of the job/internship
 * @param {string} companyName  - Company display name
 * @param {string} status       - New status (applied | shortlisted | selected | rejected)
 */
exports.sendApplicationStatusEmail = async (email, studentName, jobTitle, companyName, status) => {
  try {
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      'https://internship-placement-portal-kappa.vercel.app';

    const configs = {
      shortlisted: {
        subject: `You have been Shortlisted — ${jobTitle}`,
        color: '#f59e0b',
        emoji: '🌟',
        headline: "Congratulations! You've been Shortlisted.",
        body: `We are pleased to inform you that your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>shortlisted</strong>. The company will be reaching out soon with next steps.`,
      },
      selected: {
        subject: `You have been Selected — ${jobTitle}`,
        color: '#22c55e',
        emoji: '🏆',
        headline: "Congratulations! You've been Selected!",
        body: `Outstanding news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>selected</strong>. The company will contact you shortly with offer details.`,
      },
      rejected: {
        subject: `Application Update — ${jobTitle}`,
        color: '#ef4444',
        emoji: '📋',
        headline: 'Application Status Update',
        body: `Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful consideration, the company has decided to move forward with other candidates. Don't be discouraged — keep applying!`,
      },
      applied: {
        subject: `Application Status Updated — ${jobTitle}`,
        color: '#3b82f6',
        emoji: '📨',
        headline: 'Your Application Status has been Updated',
        body: `Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to <strong>applied</strong>. Track your status on the portal.`,
      },
    };

    const cfg = configs[status] || configs['applied'];

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align:center; margin-bottom: 24px;">
            <span style="font-size: 48px;">${cfg.emoji}</span>
            <h2 style="color: ${cfg.color}; margin: 12px 0 0;">${cfg.headline}</h2>
          </div>
          <p style="color: #555; font-size: 15px; line-height: 1.7;">Hi <strong>${studentName}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.7;">${cfg.body}</p>
          <div style="background-color: #f8f9fa; border-left: 4px solid ${cfg.color}; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
            <p style="margin:0; color:#333; font-size:14px;"><strong>📌 Job Title:</strong> ${jobTitle}</p>
            <p style="margin:8px 0 0; color:#333; font-size:14px;"><strong>🏢 Company:</strong> ${companyName}</p>
            <p style="margin:8px 0 0; color:#333; font-size:14px;"><strong>📊 Status:</strong>
              <span style="text-transform:capitalize; color:${cfg.color}; font-weight:bold;">${status}</span>
            </p>
          </div>
          <div style="text-align:center; margin: 28px 0;">
            <a href="${frontendUrl}/applications"
              style="background-color: ${cfg.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View My Applications
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 28px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            You are receiving this because you applied through the Internship Placement Portal.<br/>
            &copy; ${new Date().getFullYear()} Internship Placement Portal. All rights reserved.
          </p>
        </div>
      </div>
    `;

    console.log('\n' + '='.repeat(60));
    console.log('📧 APPLICATION STATUS EMAIL');
    console.log('='.repeat(60));
    console.log(`To: ${email} | Status: ${status} | Job: ${jobTitle}`);
    console.log('-'.repeat(60));

    // Non-fatal — never break the status update flow
    try {
      await sendMailViaProxy(email, cfg.subject, htmlContent);
      console.log(`✅ Application status email dispatched to ${email}\n`);
    } catch (proxyError) {
      console.warn(`⚠️  Could not send application status email: ${proxyError.message}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error preparing application status email:', error.message);
    return false; // Non-fatal
  }
};
