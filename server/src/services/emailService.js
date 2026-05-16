import transporter from "../config/mailer.js";
import ampTemplate from "../templates/ampTemplate.js";
import htmlTemplate from "../templates/htmlTemplate.js";
import { generateTrackingId } from "../utils/tracking.js";

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

    return info;

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

export default sendTrackingEmail;
