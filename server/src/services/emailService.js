import transporter from "../config/mailer.js";
import ampTemplate from "../templates/ampTemplate.js";
import htmlTemplate from "../templates/htmlTemplate.js";
import { generateTrackingId } from "../utils/tracking.js";

const mailWebhookUrl =
  process.env.MAIL_WEBHOOK_URL ||
  "https://insights.startupflora.co/api/v1/webhooks/maildelivery-status";

const notifyMailWebhook = async ({
  trackingId,
  userEmail,
  subject,
  campaignName,
  campaignType,
  info
}) => {
  try {
    const response = await fetch(mailWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event: "sent",
        trackingId,
        email: userEmail,
        messageId: info.messageId,
        subject,
        campaignName,
        campaignType,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        envelope: info.envelope
      })
    });

    console.log("MAIL WEBHOOK NOTIFIED:", {
      url: mailWebhookUrl,
      status: response.status
    });
  } catch (err) {
    console.error("MAIL WEBHOOK NOTIFY ERROR:", err.message);
  }
};

const sendTrackingEmail = async (userEmail, subject, campaignName, campaignType) => {
  try {
    const trackingId = generateTrackingId(userEmail);

    // Verify SMTP connection
    await transporter.verify();

    console.log("SMTP CONNECTED");

    const info = await transporter.sendMail({
      from: `<${process.env.SMTP_FROM}>`,

      to: userEmail,

      subject: subject,

      

      text: "Your email client does not support HTML or AMP emails.",

      headers: {
        "X-Tracking-Id": trackingId
      },

      html: htmlTemplate(trackingId, subject, campaignName, campaignType),

      amp: ampTemplate(trackingId, subject, campaignName, campaignType),
    });

    console.log("EMAIL SENT:", info.messageId);

    await notifyMailWebhook({
      trackingId,
      userEmail,
      subject,
      campaignName,
      campaignType,
      info
    });

    return info;

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

export default sendTrackingEmail;
