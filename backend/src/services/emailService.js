const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

// Create Nodemailer Transporter
let transporter = null;

try {
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: env.SMTP_USER && env.SMTP_PASS ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
        } : undefined
    });
} catch (err) {
    logger.warn('Failed to initialize SMTP transporter:', err.message);
}

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (!transporter || !env.SMTP_USER) {
            logger.info(`[SIMULATED EMAIL SENT] To: ${to} | Subject: ${subject}`);
            return { success: true, simulated: true };
        }

        const info = await transporter.sendMail({
            from: env.EMAIL_FROM,
            to,
            subject,
            text: text || html.replace(/<[^>]*>?/gm, ''),
            html
        });

        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        logger.error(`Error sending email to ${to}:`, err.message);
        // Do not throw to avoid crashing backend flow if SMTP fails
        return { success: false, error: err.message };
    }
};

/**
 * Send Account Registration Received (Pending Approval) Email
 */
const sendRegistrationConfirmationEmail = async (userEmail, userName) => {
    const subject = 'Account Registration Submitted - Awaiting Admin Approval';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121218; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #FFC300; margin-bottom: 5px;">WINSTAR DIGITAL PRINTING</h2>
                <p style="color: #A0A0B8; font-size: 14px; margin: 0;">PRINTING & XEROX SOLUTION</p>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Thank you for registering a business account with Winstar Digital Printing & Xerox.</p>
            <div style="background: rgba(255, 195, 0, 0.1); border-left: 4px solid #FFC300; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>STATUS: AWAITING APPROVAL</strong><br>
                Your registration has been submitted successfully. Your account is currently awaiting verification and approval from our administrator.
            </div>
            <p>Once your account is approved, you will receive an email notification enabling login to access your wholesale rates and dashboard.</p>
            <br>
            <p style="font-size: 13px; color: #A0A0B8;">If you have any urgent print requirements, please contact our support at 9345046665.</p>
        </div>
    `;
    return sendEmail({ to: userEmail, subject, html });
};

/**
 * Send Account Approved Email
 */
const sendApprovalEmail = async (userEmail, userName) => {
    const subject = 'Your Business Account Has Been Approved! - Winstar Digital Printing';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121218; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #10B981; margin-bottom: 5px;">WINSTAR DIGITAL PRINTING</h2>
                <p style="color: #A0A0B8; font-size: 14px; margin: 0;">WHOLESALE PORTAL ACCESS</p>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Great news! Your account registration has been <strong>APPROVED</strong> by the administrator.</p>
            <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                You can now log in using the credentials you created during registration to unlock 15% wholesale printing discounts, express job dispatch, and bulk cart ordering.
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${env.FRONTEND_URL}/login.html" style="background: linear-gradient(135deg, #D90429 0%, #E01E5A 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">SIGN IN TO DASHBOARD &rarr;</a>
            </div>
            <p style="font-size: 13px; color: #A0A0B8;">Thank you for choosing Winstar Digital Printing & Xerox.</p>
        </div>
    `;
    return sendEmail({ to: userEmail, subject, html });
};

/**
 * Send Account Rejection Email
 */
const sendRejectionEmail = async (userEmail, userName, reason = '') => {
    const subject = 'Business Account Registration Notice - Winstar Digital Printing';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121218; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #EF4444; margin-bottom: 5px;">WINSTAR DIGITAL PRINTING</h2>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>We regret to inform you that your business account registration request was not approved at this time.</p>
            ${reason ? `<div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px;"><strong>Reason:</strong> ${reason}</div>` : ''}
            <p>If you believe this is an error or would like to clarify details, please contact our administrator directly.</p>
            <p style="font-size: 13px; color: #A0A0B8;">Support Contact: contact@winstardigital.com | Phone: 9345046665</p>
        </div>
    `;
    return sendEmail({ to: userEmail, subject, html });
};

module.exports = {
    sendRegistrationConfirmationEmail,
    sendApprovalEmail,
    sendRejectionEmail
};
