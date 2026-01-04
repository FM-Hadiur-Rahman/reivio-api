// src/utils/email/sendEmail.js
require("dotenv").config();

const enabled = String(process.env.EMAIL_ENABLED).toLowerCase() === "true";
const provider = String(process.env.EMAIL_PROVIDER || "ses").toLowerCase();

module.exports = async function sendEmail({ to, subject, html, text }) {
  if (!enabled) return { skipped: true };

  if (provider !== "ses") {
    // Safety: don't allow accidental SendGrid calls in prod
    throw new Error(`EMAIL_PROVIDER_NOT_SES: ${provider}`);
  }

  const sendWithSES = require("./sendWithSES");
  return await sendWithSES({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });
};
