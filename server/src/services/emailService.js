import transporter from "../config/mailer.js";
import ampTemplate from "../templates/ampTemplate.js";
import htmlTemplate from "../templates/htmlTemplate.js";
import AmpTemplate from "../models/AmpTemplate.js";
import { renderTrackedTemplate } from "../utils/generateAmpTemplate.js";
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

const getSavedTemplate = async ({ templateId, templateSlug }) => {
  if (templateId) {
    return AmpTemplate.findOne({
      _id: templateId,
      isActive: true
    });
  }

  if (templateSlug) {
    return AmpTemplate.findOne({
      slug: templateSlug,
      isActive: true
    });
  }

  return null;
};

const sendTrackingEmail = async (
  userEmail,
  subject,
  campaignName,
  campaignType,
  options = {}
) => {
  try {
    const trackingId = generateTrackingId(userEmail);
    const savedTemplate = await getSavedTemplate(options);

    if ((options.templateId || options.templateSlug) && !savedTemplate) {
      throw new Error("Template not found or inactive");
    }

    const renderedTemplate = savedTemplate
      ? renderTrackedTemplate({
          template: savedTemplate,
          trackingId,
          email: userEmail,
          subject,
          campaignName,
          campaignType,
          variables: options.variables
        })
      : null;

    // Verify SMTP connection
    await transporter.verify();

    console.log("SMTP CONNECTED");

    const mailOptions = {
      from: `<${process.env.SMTP_FROM}>`,

      to: userEmail,

      subject: renderedTemplate?.subject || subject,

      

      text:
        renderedTemplate?.text ||
        "Your email client does not support HTML or AMP emails.",

      headers: {
        "X-Tracking-Id": trackingId
      },

      html:
        renderedTemplate?.html ||
        htmlTemplate(trackingId, subject, campaignName, campaignType),

      amp: savedTemplate
        ? renderedTemplate?.amp || undefined
        : ampTemplate(trackingId, subject, campaignName, campaignType),
    };

    const info = await transporter.sendMail(mailOptions);

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
