import transporter from "../config/mailer.js";

import ampTemplate from "../templates/ampTemplate.js";

import htmlTemplate from "../templates/htmlTemplate.js";

import { generateTrackingId }
from "../utils/tracking.js";

const sendTrackingEmail = async (userEmail) => {

   try {

      const trackingId = generateTrackingId(userEmail);

      await transporter.verify();

      console.log("SMTP CONNECTED");

      const info =
         await transporter.sendMail({

            from:
               `"Tracker Test" <${process.env.SMTP_FROM}>`,

            to: userEmail,

            subject:
               "AMP + HTML Tracking Test",

            text: "Tracking Email",

            html:
               htmlTemplate(trackingId),

            amp:
               ampTemplate(trackingId)

         });

      console.log(
         "EMAIL SENT:",
         info.messageId
      );

   } catch (err) {

      console.error(
         "EMAIL ERROR:",
         err
      );

   }

};

export default sendTrackingEmail;