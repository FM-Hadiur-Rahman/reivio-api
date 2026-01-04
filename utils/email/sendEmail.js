// server/utils/email/sendEmail.js
require("dotenv").config();

const sendWithSES = require("./sendWithSES");
const sendWithSendGrid = require("./sendWithSendGrid");

const enabled = String(process.env.EMAIL_ENABLED).toLowerCase() === "true";
const fallbackEnabled =
  String(process.env.SENDGRID_FALLBACK_ENABLED || "true").toLowerCase() ===
  "true";

const FROM_EMAIL = (process.env.FROM_EMAIL || "").trim();
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

function parseFromToString(raw) {
  // Accept "Name <email@x.com>" OR "email@x.com"
  const m = /^(.*)<\s*([^<>@\s]+@[^<>@\s]+)\s*>$/.exec(raw);
  if (m) return `${m[1].trim().replace(/^"|"$/g, "")} <${m[2].trim()}>`;
  return raw;
}

module.exports = async function sendEmail({ to, subject, html, text }) {
  if (!enabled) return { skipped: true };
  if (!isEmail(to)) throw new Error("INVALID_TO_EMAIL");

  const from = parseFromToString(FROM_EMAIL);
  // basic validation of FROM
  const fromEmail = FROM_EMAIL.includes("<")
    ? FROM_EMAIL.split("<")[1].replace(">", "").trim()
    : FROM_EMAIL;
  if (!isEmail(fromEmail)) throw new Error("INVALID_FROM_EMAIL_ENV");

  // 1) Try SES first
  try {
    return await sendWithSES({ from, to, subject, html, text });
  } catch (err) {
    console.error("❌ SES failed →", err.message);
    if (!fallbackEnabled) throw err;
  }

  // 2) Fallback to SendGrid
  return await sendWithSendGrid({ from, to, subject, html });
};
