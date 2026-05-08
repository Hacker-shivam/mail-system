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
app.use(express.urlencoded({ extended: true }));

// IMPORTANT FIX (proxy support)
app.set("trust proxy", true);

// database connection

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

// tracking

const trackHandler = (emailType) => {
   return async (req, res) => {

      try {

         console.log("OPEN HIT:", req.originalUrl);

         //  IP handling
         const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

         const geo = geoip.lookup(ip);

         const parser = new UAParser(req.headers["user-agent"]);

         const email = Buffer.from(req.params.id, "base64").toString();

         const doc = await Tracking.create({

            trackingId: req.params.id,
            email,
            emailType,
            eventType: "open",

            ip,

            country: geo?.country || "Unknown",
            city: geo?.city || "Unknown",

            browser: parser.getBrowser().name,
            os: parser.getOS().name,
            device: parser.getDevice().type,

            userAgent: req.headers["user-agent"]

         });

         console.log(`${emailType.toUpperCase()} OPEN SAVED:`, email);

         //  anti-cache pixel (VERY IMPORTANT)
         const pixel = Buffer.from(
            "R0lGODlhAQABAAAAACwAAAAAAQABAAA=",
            "base64"
         );

         res.set({
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
         });

         return res.send(pixel);

      } catch (err) {

         console.error("OPEN TRACK ERROR:", err);

         return res.status(500).send("Tracking Error");

      }

   };
};

/* ------------------ OPEN ROUTES ------------------ */

app.get("/track/open-html/:id", trackHandler("html"));
app.get("/track/open-amp/:id", trackHandler("amp"));

/* ------------------ CLICK TRACKING ------------------ */

app.get("/track/click/:id", async (req, res) => {

   try {

      const ip =
         req.headers["x-forwarded-for"]?.split(",")[0] ||
         req.socket.remoteAddress;

      const geo = geoip.lookup(ip);

      const parser = new UAParser(req.headers["user-agent"]);

      const email = Buffer.from(req.params.id, "base64").toString();

      await Tracking.create({

         trackingId: req.params.id,
         email,
         eventType: "click",

         ip,

         country: geo?.country || "Unknown",
         city: geo?.city || "Unknown",

         browser: parser.getBrowser().name,
         os: parser.getOS().name,
         device: parser.getDevice().type,

         userAgent: req.headers["user-agent"],

         clickedUrl: req.query.url

      });

      console.log("CLICK TRACKED:", email);

      return res.redirect(req.query.url);

   } catch (err) {

      console.error("CLICK ERROR:", err);

      return res.status(500).send("Click Tracking Error");

   }

});

// AMP form tracking

app.post("/track/form-amp/:id", async (req, res) => {

   try {

      const email = Buffer.from(req.params.id, "base64").toString();

      await Tracking.create({

         trackingId: req.params.id,
         email,
         emailType: "amp",
         eventType: "form_submit",
         meta: req.body,
         ip: req.ip

      });

      console.log("AMP FORM:", email);

      res.json({ success: true });

   } catch (err) {

      console.error("AMP FORM ERROR:", err);

      res.status(500).json({ error: true });

   }

});

// HTML form tracking (fallback for non-AMP clients)

app.post("/track/form-html/:id", async (req, res) => {

   try {

      const email = Buffer.from(req.params.id, "base64").toString();

      await Tracking.create({

         trackingId: req.params.id,
         email,
         emailType: "html",
         eventType: "form_submit",
         meta: req.body,
         ip: req.ip

      });

      console.log("HTML FORM:", email);

      res.send("Form Submitted");

   } catch (err) {

      console.error("HTML FORM ERROR:", err);

      res.status(500).send("Form Tracking Error");

   }

});

// start server

app.listen(process.env.PORT, () => {
   console.log(`Server Running On ${process.env.PORT}`);
});