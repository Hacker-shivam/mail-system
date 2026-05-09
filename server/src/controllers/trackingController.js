import Tracking from "../models/Tracking.js";
import getRenderData from "../utils/renderData.js";

/* OPEN TRACKING */

export const trackHandler = (emailType) => {

   return async (req, res) => {

      try {

         const email = Buffer
            .from(req.params.id, "base64")
            .toString();

         await Tracking.create({

            trackingId: req.params.id,

            email,

            emailType,

            eventType: "open",

            render: getRenderData(req)

         });

         const pixel = Buffer.from(
            "R0lGODlhAQABAAAAACwAAAAAAQABAAA=",
            "base64"
         );

         res.set({

            "Content-Type": "image/gif",

            "Cache-Control":
               "no-store, no-cache, must-revalidate"

         });

         return res.send(pixel);

      } catch (err) {

         console.error(err);

         return res.status(500).send("Tracking Error");

      }

   };

};

/* CLICK TRACKING */

export const clickTracking = async (req, res) => {

   try {

      const email = Buffer
         .from(req.params.id, "base64")
         .toString();

      await Tracking.create({

         trackingId: req.params.id,

         email,

         eventType: "click",

         render: getRenderData(req),

         clickedUrl: req.query.url

      });

      return res.redirect(req.query.url);

   } catch (err) {

      console.error(err);

      return res
         .status(500)
         .send("Click Tracking Error");

   }

};

/* AMP FORM */

export const ampFormTracking = async (req, res) => {
  try {
    const trackingId = req.params.id;

    const email = Buffer.from(trackingId, "base64").toString();

    const { emailType, ...formData } = req.body;

    await Tracking.create({
      trackingId,
      email,
      emailType: "amp",
      eventType: "form_submit",
      render: getRenderData(req),
      formSubmission: formData,
      createdAt: new Date()
    });

    return res.json({
      success: true,
      source: "AMP",
      message: "AMP form submitted successfully"
    });

  } catch (err) {
    console.error("AMP FORM ERROR:", err);

    return res.status(500).json({
      success: false,
      source: "AMP",
      message: "Form submission failed"
    });
  }
};

/* HTML FORM */

export const htmlFormTracking = async (req, res) => {
  try {
    const trackingId = req.params.id;

    const email = Buffer.from(trackingId, "base64").toString();

    const { emailType, ...formData } = req.body;

    await Tracking.create({
      trackingId,
      email,
      emailType: "html",
      eventType: "form_submit",
      render: getRenderData(req),
      formSubmission: formData,
      createdAt: new Date()
    });

    return res.send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:40px">
          <h2 style="color:green">✅ Form Submitted Successfully</h2>
          <p>You can close this window now.</p>
        </body>
      </html>
    `);

  } catch (err) {
    console.error("HTML FORM ERROR:", err);

    return res.status(500).send(`
      <h2 style="color:red">Form Tracking Error</h2>
    `);
  }
};