import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

import Tracking from "./src/models/Tracking.js";

dotenv.config();

const app = express();

/* ------------------ MIDDLEWARE ------------------ */

app.use(express.json());

app.use(express.urlencoded({
   extended: true
}));

// proxy support

app.set("trust proxy", true);

/* ------------------ AMP + CORS ------------------ */

app.use((req, res, next) => {

   res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
   );

   res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
   );

   res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
   );

   res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      process.env.API_URL
   );

   res.setHeader(
      "Access-Control-Expose-Headers",
      "AMP-Access-Control-Allow-Source-Origin"
   );

   if (req.method === "OPTIONS") {
      return res.sendStatus(200);
   }

   next();
});

/* ------------------ DATABASE ------------------ */

mongoose.connect(process.env.MONGO_URI)

.then(() => {

   console.log("MongoDB Connected");

})

.catch((err) => {

   console.log("MongoDB Error:", err);

});

/* ------------------ HELPER ------------------ */

const getRenderData = (req) => {

   const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

   const geo = geoip.lookup(ip);

   const parser = new UAParser(req.headers["user-agent"]);

   return {

      ip,

      country: geo?.country || "Unknown",

      city: geo?.city || "Unknown",

      browser:
         parser.getBrowser().name || "Unknown",

      os:
         parser.getOS().name || "Unknown",

      device:
         parser.getDevice().type || "desktop",

      userAgent:
         req.headers["user-agent"] || "Unknown"

   };
};

/* ------------------ OPEN TRACKING ------------------ */

const trackHandler = (emailType) => {

   return async (req, res) => {

      try {

         console.log(
            "OPEN HIT:",
            req.originalUrl
         );

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

         console.log(
            `${emailType.toUpperCase()} OPEN SAVED:`,
            email
         );

         // transparent tracking pixel

         const pixel = Buffer.from(
            "R0lGODlhAQABAAAAACwAAAAAAQABAAA=",
            "base64"
         );

         res.set({

            "Content-Type": "image/gif",

            "Cache-Control":
               "no-store, no-cache, must-revalidate, proxy-revalidate",

            "Pragma": "no-cache",

            "Expires": "0"

         });

         return res.send(pixel);

      } catch (err) {

         console.error(
            "OPEN TRACK ERROR:",
            err
         );

         return res
            .status(500)
            .send("Tracking Error");

      }

   };

};

/* ------------------ OPEN ROUTES ------------------ */

app.get(
   "/track/open-html/:id",
   trackHandler("html")
);

app.get(
   "/track/open-amp/:id",
   trackHandler("amp")
);

/* ------------------ CLICK TRACKING ------------------ */

app.get("/track/click/:id", async (req, res) => {

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

      console.log(
         "CLICK TRACKED:",
         email
      );

      return res.redirect(req.query.url);

   } catch (err) {

      console.error(
         "CLICK ERROR:",
         err
      );

      return res
         .status(500)
         .send("Click Tracking Error");

   }

});

/* ------------------ AMP FORM TRACKING ------------------ */

app.post("/track/form-amp/:id", async (req, res) => {

   try {

      const email = Buffer
         .from(req.params.id, "base64")
         .toString();

      const {
         trackingId,
         emailType,
         ...formData
      } = req.body;

      await Tracking.create({

         trackingId: req.params.id,

         email,

         emailType: "amp",

         eventType: "form_submit",

         render: getRenderData(req),

         formSubmission: formData

      });

      console.log(
         "AMP FORM SUBMITTED:",
         email
      );

      return res.json({

         success: true,

         message: "AMP Form Submitted"

      });

   } catch (err) {

      console.error(
         "AMP FORM ERROR:",
         err
      );

      return res.status(500).json({

         success: false,

         error: "AMP Form Tracking Error"

      });

   }

});

/* ------------------ HTML FORM TRACKING ------------------ */

app.post("/track/form-html/:id", async (req, res) => {

   try {

      const email = Buffer
         .from(req.params.id, "base64")
         .toString();

      const {
         trackingId,
         emailType,
         ...formData
      } = req.body;

      await Tracking.create({

         trackingId: req.params.id,

         email,

         emailType: "html",

         eventType: "form_submit",

         render: getRenderData(req),

         formSubmission: formData

      });

      console.log(
         "HTML FORM SUBMITTED:",
         email
      );

      return res.send(`
         <h2>Form Submitted Successfully</h2>
      `);

   } catch (err) {

      console.error(
         "HTML FORM ERROR:",
         err
      );

      return res
         .status(500)
         .send("Form Tracking Error");

   }

});

/* ------------------ HEALTH CHECK ------------------ */

app.get("/", (req, res) => {

   res.send("Tracking Server Running");

});

/* ------------------ SERVER ------------------ */

app.listen(process.env.PORT, () => {

   console.log(
      `Server Running On Port ${process.env.PORT}`
   );

});