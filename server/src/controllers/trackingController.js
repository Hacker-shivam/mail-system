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

              campaignName: req.query.campaignName,

              campaignType: req.query.campaignType,

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

         campaignName: req.query.campaignName,

         campaignType: req.query.campaignType,

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

    const {
    emailType,
    campaignName,
    campaignType,
   ...formData
    } = req.body;

    await Tracking.create({

    trackingId,

    email,

    campaignName,

    campaignType,

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

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      process.env.API_URL
    );

    res.setHeader(
      "Access-Control-Expose-Headers",
      "AMP-Access-Control-Allow-Source-Origin"
    );

    const trackingId = req.params.id;

    const email = Buffer
      .from(trackingId, "base64")
      .toString();

    const body = req.body || {};

    const {
   emailType,
   campaignName,
   campaignType,
   ...formData
  } = body;

    await Tracking.create({

   trackingId,

   email,

   campaignName,

   campaignType,

   emailType: emailType || "html",

   eventType: "form_submit",

   render: getRenderData(req),

   formSubmission: formData,

   createdAt: new Date()

});
    return res.json({

      success: true,

      message: "✅ Form Submitted Successfully"

    });

  } catch (err) {

    console.error("HTML FORM ERROR:", err);

    return res.status(500).json({

      success: false,

      message: "❌ Form Tracking Error"

    });
  }
};