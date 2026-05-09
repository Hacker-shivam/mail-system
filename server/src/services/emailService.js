import transporter from "../config/mailer.js";
import ampTemplate from "../templates/ampTemplate.js";
import htmlTemplate from "../templates/htmlTemplate.js";
import { generateTrackingId } from "../utils/tracking.js";

const sendTrackingEmail = async (userEmail) => {
  try {
    const trackingId = generateTrackingId(userEmail);

    // Verify SMTP connection
    await transporter.verify();

    console.log("SMTP CONNECTED");

    const info = await transporter.sendMail({
      from: `"Tracker Test" <${process.env.SMTP_FROM}>`,

      to: userEmail,

      subject: "AMP + HTML Tracking Test",

      text: "Your email client does not support HTML or AMP emails.",

      html: htmlTemplate(trackingId),

      amp: ampTemplate(trackingId),
    });

    console.log("EMAIL SENT:", info.messageId);

    return info;

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
};

export default sendTrackingEmail;