// server/utils/email/sendWithSES.js
require("dotenv").config();
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

const ses = new SESv2Client({ region: process.env.AWS_REGION });

module.exports = async function sendWithSES({ from, to, subject, html, text }) {
  const cmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject || "(no subject)", Charset: "UTF-8" },
        Body: {
          Html: { Data: html || "", Charset: "UTF-8" },
          Text: { Data: text || "", Charset: "UTF-8" },
        },
      },
    },
  });

  const res = await ses.send(cmd);
  console.log(`📧 SES OK (MessageId=${res.MessageId}) → ${to}`);
  return { provider: "ses", messageId: res.MessageId };
};
