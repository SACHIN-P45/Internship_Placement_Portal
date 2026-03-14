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
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
            <div style="background: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;">
              🔐
            </div>
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Password Reset</h2>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin-top: 0; margin-bottom: 16px;">
              Hi ${userName},
            </p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset your password for your Internship Placement Portal account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              To choose a new password, click the button below. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
                Reset Password
              </a>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <code style="color: #3b82f6; font-size: 13px; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: block; padding: 8px; background: #eff6ff; border-radius: 4px;">
                ${resetUrl}
              </code>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              &copy; ${new Date().getFullYear()} Internship Placement Portal.<br/>All rights reserved.
            </p>
          </div>

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
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
            <div style="background: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;">
              👋
            </div>
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Welcome Aboard!</h2>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin-top: 0; margin-bottom: 16px;">
              Hi ${userName},
            </p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Your account has been successfully created. You can now login to your dashboard and start exploring internship opportunities.
            </p>
            
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="${loginUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                Go to Login
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              &copy; ${new Date().getFullYear()} Internship Placement Portal.<br/>All rights reserved.
            </p>
          </div>

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
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: ${cfg.color}; padding: 32px 24px; text-align: center;">
            <div style="background: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;">
              ${cfg.emoji}
            </div>
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">${cfg.headline}</h2>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin-top: 0; margin-bottom: 16px;">
              Hi <strong>${studentName}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              ${cfg.body}
            </p>
            
            <div style="background-color: #f9fafb; border-left: 4px solid ${cfg.color}; padding: 16px 20px; border-radius: 4px; margin-bottom: 32px; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
              <p style="margin:0 0 8px 0; color:#374151; font-size:14px;"><strong>📌 Job Title:</strong> ${jobTitle}</p>
              <p style="margin:0 0 8px 0; color:#374151; font-size:14px;"><strong>🏢 Company:</strong> ${companyName}</p>
              <p style="margin:0; color:#374151; font-size:14px;"><strong>📊 Status:</strong>
                <span style="text-transform:capitalize; color:${cfg.color}; font-weight:700;">${status}</span>
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="${frontendUrl}/applications" style="background-color: ${cfg.color}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px ${cfg.color}40;">
                View My Applications
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              You are receiving this because you applied through the Internship Placement Portal.<br/>
              &copy; ${new Date().getFullYear()} Internship Placement Portal. All rights reserved.
            </p>
          </div>

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
