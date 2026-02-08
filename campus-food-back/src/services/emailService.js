const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.qq.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/**
 * 发送验证码邮件
 * @param {string} email 收件人邮箱
 * @param {string} code 6位验证码
 * @returns {Promise<void>}
 */
async function sendVerificationCode(email, code) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[Email] SMTP未配置，验证码（仅开发）:", code);
    return;
  }
  const transport = getTransporter();
  await transport.sendMail({
    from: `"校园美食拼单" <${SMTP_USER}>`,
    to: email,
    subject: "【校园美食拼单】验证码",
    text: `您的验证码是：${code}，10分钟内有效，请勿泄露。`,
    html: `
      <p>您的验证码是：<strong style="font-size:20px;letter-spacing:4px;">${code}</strong></p>
      <p>10分钟内有效，请勿泄露给他人。</p>
      <p style="color:#999;font-size:12px;">如非本人操作，请忽略此邮件。</p>
    `,
  });
}

module.exports = { sendVerificationCode };
