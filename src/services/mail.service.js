// src/services/mail.service.js - SendGrid version
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

const {
  SENDGRID_API_KEY,
  MAIL_FROM,
  NODE_ENV
} = process.env;

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Fallback transporter for development
const fallbackTransporter = {
  sendMail: async (opts) => {
    if (NODE_ENV !== 'production') {
      console.log('[DEV] Email would be sent:', {
        to: opts.to,
        subject: opts.subject
      });
      return { messageId: 'dev-' + crypto.randomUUID() };
    }
    throw new Error('SendGrid API key not configured in production.');
  }
};

// ---- Helper: render HTML template ----
function baseHtmlTemplate(title, bodyHtml) {
  return `
  <!doctype html>
  <html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; background:#f6f8fb; margin:0; padding:24px; }
      .card { max-width:560px; margin:0 auto; background:#fff; border-radius:12px; padding:24px; box-shadow:0 6px 20px rgba(0,0,0,.06); }
      h1,h2,h3 { margin:0 0 12px; }
      .btn { display:inline-block; padding:10px 16px; background:#0d6efd; color:#fff; text-decoration:none; border-radius:8px; }
      .muted { color:#6c757d; font-size:12px; margin-top:16px; }
      code { background:#f1f3f5; padding:2px 6px; border-radius:6px; font-weight:600; letter-spacing:1px; }
    </style>
  </head>
  <body>
    <div class="card">
      ${bodyHtml}
      <p class="muted">If you did not request this action, please ignore this email.</p>
    </div>
  </body>
  </html>`;
}

// ---- Public API ----
/**
 * Send general email using SendGrid
 * @param {{to:string, subject:string, text?:string, html?:string}} options
 */
export async function sendMail(options) {
  if (!SENDGRID_API_KEY) {
    return fallbackTransporter.sendMail(options);
  }

  const from = MAIL_FROM || 'no-reply@online-academy.com';
  
  const msg = {
    to: options.to,
    from: from,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const response = await sgMail.send(msg);
    return { 
      messageId: response[0].headers['x-message-id'],
      response: response[0].statusCode
    };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw error;
  }
}

/**
 * Send OTP code 6 digits
 * @param {string} to
 * @param {string} otpCode (generated in controller/service; DO NOT log in prod)
 */
export async function sendOtpEmail(to, otpCode) {
  const subject = 'Account Verification OTP - Mentor Online Academy';
  const text = `Your OTP code is: ${otpCode}. The code will expire in 10 minutes.`;
  const html = baseHtmlTemplate(
    'Account Verification',
    `
      <h2>Account Verification OTP</h2>
      <p>Your code is:</p>
      <p style="font-size:22px;margin:8px 0 16px;">
        <code>${otpCode}</code>
      </p>
      <p>The code will expire in <strong>10 minutes</strong>.</p>
    `
  );
  return sendMail({ to, subject, text, html });
}

/**
 * Send reset password OTP email
 * @param {string} to
 * @param {string} otpCode
 */
export async function sendResetPasswordEmail(to, otpCode) {
  const subject = 'Password Reset OTP - Mentor Online Academy';
  const text = `Your password reset OTP code is: ${otpCode}. The code will expire in 10 minutes.`;
  const html = baseHtmlTemplate(
    'Password Reset',
    `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Your reset code is:</p>
      <p style="font-size:22px;margin:8px 0 16px;">
        <code>${otpCode}</code>
      </p>
      <p>The code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `
  );
  return sendMail({ to, subject, text, html });
}

/**
 * Send course notice email
 */
export async function sendCourseNotice(to, { title, message, ctaUrl, ctaText='View Details' }) {
  const subject = title || 'Notification from Mentor Online Academy';
  const html = baseHtmlTemplate(
    'Notification',
    `
      <h2>${title || 'Notification'}</h2>
      <p>${message || ''}</p>
      ${ctaUrl ? `<p><a class="btn" href="${ctaUrl}" target="_blank" rel="noopener"> ${ctaText} </a></p>` : ''}
    `
  );
  const text = (message || '') + (ctaUrl ? `\n\n${ctaText}: ${ctaUrl}` : '');
  return sendMail({ to, subject, text, html });
}

/**
 * Health check for SendGrid
 */
export async function verifySmtp() {
  if (!SENDGRID_API_KEY) {
    return { ok: false, error: 'SendGrid API key not configured' };
  }
  
  try {
    // SendGrid doesn't have a verify method, so we just check if API key exists
    return { ok: true, provider: 'SendGrid' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
