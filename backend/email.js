import nodemailer from 'nodemailer';

export function createPasswordResetMailer(environment = process.env) {
  const host = environment.SMTP_HOST;
  const from = environment.SMTP_FROM;
  if (!host || !from) return null;

  const port = Number(environment.SMTP_PORT || 587);
  const secure = environment.SMTP_SECURE === 'true';
  const auth = environment.SMTP_USER
    ? { user: environment.SMTP_USER, pass: environment.SMTP_PASS || '' }
    : undefined;
  const transporter = nodemailer.createTransport({ host, port, secure, auth });
  const configuredResetUrl = environment.PASSWORD_RESET_URL || 'http://127.0.0.1:5173';

  return async ({ email, name, token }) => {
    const resetUrl = new URL(configuredResetUrl);
    resetUrl.hash = `/reset-password?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Reset your Career Navigator password',
      text: [
        `Hello ${name || 'student'},`,
        '',
        'We received a request to reset your Career Navigator password.',
        'Open the link below within 30 minutes to choose a new password:',
        resetUrl.toString(),
        '',
        'If you did not request this, you can ignore this message. Your password will not change.'
      ].join('\n'),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px;margin:auto;padding:24px">`
        + `<h2>Reset your Career Navigator password</h2>`
        + `<p>Hello ${escapeHtml(name || 'student')},</p>`
        + `<p>We received a request to reset your password. This link expires in 30 minutes.</p>`
        + `<p><a href="${escapeHtml(resetUrl.toString())}" style="display:inline-block;background:#6d4aff;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Choose a new password</a></p>`
        + `<p>If you did not request this, you can safely ignore this email.</p></div>`
    });
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
