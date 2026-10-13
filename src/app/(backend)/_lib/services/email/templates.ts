/**
 * Hisabo Transactional Email Templates Engine
 * Clean Notion-inspired, mobile-friendly HTML & plaintext email templates.
 */

interface BaseEmailOptions {
  to: string;
  recipientName: string;
}

export interface WelcomeEmailOptions extends BaseEmailOptions {
  verificationCode: string;
  verificationLink?: string;
}

export interface SettlementClaimedEmailOptions extends BaseEmailOptions {
  payerName: string;
  amount: string;
  currency: string;
  groupName: string;
  actionUrl: string;
}

export interface GroupInviteEmailOptions extends BaseEmailOptions {
  inviterName: string;
  groupName: string;
  inviteUrl: string;
  expiresInDays?: number;
}

function baseHtmlTemplate(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; color: #0F172A; margin: 0; padding: 24px 12px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #185CFF; padding: 28px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255, 255, 255, 0.8); margin: 4px 0 0; font-size: 12px; }
    .content { padding: 32px 24px; }
    .btn { display: inline-block; background: #185CFF; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 10px; margin: 20px 0; }
    .footer { padding: 20px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B; }
    .badge { display: inline-block; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; font-weight: 700; font-size: 18px; letter-spacing: 4px; padding: 10px 20px; border-radius: 8px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hisabo</h1>
      <p>Split easy. Settle smart.</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>You received this email because you are a registered user of Hisabo.<br>Zero-loss ledger · Multi-currency partitioning · Auditable settlements.</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildWelcomeEmail(opts: WelcomeEmailOptions) {
  const subject = "Welcome to Hisabo — Verify your account";
  const body = `
    <h2 style="margin-top:0;font-size:18px;font-weight:700;">Welcome, ${opts.recipientName}!</h2>
    <p style="font-size:13px;color:#475569;line-height:1.6;">Thank you for creating an account with Hisabo. Use the verification code below to confirm your email address and activate your shared expense ledgers:</p>
    <div style="text-align:center;margin:24px 0;">
      <div class="badge">${opts.verificationCode}</div>
    </div>
    <p style="font-size:12px;color:#64748B;">This verification code will expire in 15 minutes. If you did not sign up for Hisabo, you can safely ignore this email.</p>
  `;

  return {
    subject,
    html: baseHtmlTemplate(subject, body),
    text: `Welcome to Hisabo, ${opts.recipientName}!\n\nYour verification code is: ${opts.verificationCode}\n\nSplit easy. Settle smart.`,
  };
}

export function buildSettlementClaimedEmail(opts: SettlementClaimedEmailOptions) {
  const subject = `[Hisabo] Action Required: ${opts.payerName} recorded a ${opts.currency} ${opts.amount} payment to you`;
  const body = `
    <h2 style="margin-top:0;font-size:18px;font-weight:700;">New Settlement Claimed</h2>
    <p style="font-size:13px;color:#475569;line-height:1.6;">
      <strong>${opts.payerName}</strong> has recorded an offline payment transfer in <strong>${opts.groupName}</strong>:
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
      <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">Amount Claimed</div>
      <div style="font-size:26px;font-weight:900;color:#0F172A;font-family:monospace;margin-top:4px;">${opts.currency} ${opts.amount}</div>
    </div>
    <p style="font-size:13px;color:#475569;line-height:1.6;">
      Please verify your banking app or STC Pay balance to ensure the funds were received, then confirm receipt in Hisabo to square the ledger:
    </p>
    <div style="text-align:center;">
      <a href="${opts.actionUrl}" class="btn">Review & Confirm Settlement</a>
    </div>
  `;

  return {
    subject,
    html: baseHtmlTemplate(subject, body),
    text: `${opts.payerName} recorded a ${opts.currency} ${opts.amount} payment to you in ${opts.groupName}.\n\nPlease review and confirm receipt at: ${opts.actionUrl}`,
  };
}

export function buildGroupInviteEmail(opts: GroupInviteEmailOptions) {
  const subject = `[Hisabo] You were invited to join ${opts.groupName}`;
  const body = `
    <h2 style="margin-top:0;font-size:18px;font-weight:700;">You're Invited!</h2>
    <p style="font-size:13px;color:#475569;line-height:1.6;">
      <strong>${opts.inviterName}</strong> has invited you to join their shared group pool <strong>${opts.groupName}</strong> on Hisabo.
    </p>
    <p style="font-size:13px;color:#475569;line-height:1.6;">
      Join to track shared expenses, split grocery/rent bills fairly, and settle balances with zero confusion.
    </p>
    <div style="text-align:center;">
      <a href="${opts.inviteUrl}" class="btn">Accept Invitation & Join Group</a>
    </div>
    <p style="font-size:11px;color:#64748B;">This secure cryptographic invitation token is valid for ${opts.expiresInDays || 7} days.</p>
  `;

  return {
    subject,
    html: baseHtmlTemplate(subject, body),
    text: `${opts.inviterName} invited you to join ${opts.groupName} on Hisabo.\n\nAccept your invite here: ${opts.inviteUrl}`,
  };
}
