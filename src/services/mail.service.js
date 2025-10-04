// src/services/mail.service.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,     // tuỳ chọn: "Online Academy <no-reply@domain.com>"
  NODE_ENV
} = process.env;

// ---- Transporter (pool) ----
let transporter;
function buildTransporter() {
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    // Fallback dev: log ra console, KHÔNG gửi thật
    return {
      sendMail: async (opts) => {
        if (NODE_ENV !== 'production') {
          // tránh lộ OTP/mật khẩu trên console ở production
          // Development mode - emails are not sent
          return { messageId: 'dev-' + crypto.randomUUID() };
        }
        throw new Error('SMTP not configured in production.');
      }
    };
  }

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || 587,
    secure: Number(MAIL_PORT) === 465, // true if using 465
    auth: { user: MAIL_USER, pass: MAIL_PASS },
    pool: true,      // kết nối pool
    maxConnections: 5,
    maxMessages: 50
  });
}
transporter = buildTransporter();

// ---- Helper: render HTML cơ bản (không dùng user input chưa sanitize) ----
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
 * Send general email
 * @param {{to:string, subject:string, text?:string, html?:string}} options
 */
export async function sendMail(options) {
  const from = MAIL_FROM || `Online Academy <${MAIL_USER || 'no-reply@local.test'}>`;
  const info = await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
  return info;
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

// ---- Health check (tuỳ chọn bật ở route /_mail/verify) ----
export async function verifySmtp() {
  if (!transporter.verify) return { ok: true, note: 'Dev fallback transporter' };
  try {
    const ok = await transporter.verify();
    return { ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
