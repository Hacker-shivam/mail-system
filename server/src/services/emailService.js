import transporter from "../config/mailer.js";
import ampTemplate from "../templates/ampTemplate.js";
import htmlTemplate from "../templates/htmlTemplate.js";
import { generateTrackingId } from "../utils/tracking.js";

const sendTrackingEmail = async (
  userEmail,
  subject,
  campaignName,
  campaignType
) => {
  try {

    const trackingId = generateTrackingId(userEmail);

    // Verify SMTP
    await transporter.verify();

    console.log("SMTP CONNECTED");

    const info = await transporter.sendMail({

      from: `<${process.env.SMTP_FROM}>`,

      to: userEmail,

      subject,

      text: "Your email client does not support HTML or AMP emails.",

      html: htmlTemplate(
        trackingId,
        subject,
        campaignName,
        campaignType
      ),

      amp: ampTemplate(
        trackingId,
        subject,
        campaignName,
        campaignType
      ),
    });

    console.log("EMAIL SENT");
    console.log("MESSAGE ID:", info.messageId);

    console.log("ACCEPTED:", info.accepted);

    console.log("REJECTED:", info.rejected);

    console.log("RESPONSE:", info.response);

    return info;

  } catch (err) {

    console.log("EMAIL ERROR");

    console.log("EMAIL:", userEmail);

    console.log("ERROR MESSAGE:", err.message);

    console.log("ERROR CODE:", err.code);

    console.log("FULL ERROR:", err);

    throw err;
  }
};

export default sendTrackingEmail;