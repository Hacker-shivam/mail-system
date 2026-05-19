import express from "express";
import { unsubscribeHandler } from "../controllers/unsubscribeController.js";

import {
   trackHandler,
   clickTracking,
   ampFormTracking,
   htmlFormTracking
} from "../controllers/trackingController.js";

import { analyticsOverview } from "../controllers/analyticsController.js";
import formTemplate  from "../templates/formTemplate.js";
import AmpTemplate from "../models/AmpTemplate.js";
import { renderTrackedFormTemplate } from "../utils/generateAmpTemplate.js";

const router = express.Router();

/* OPEN */

router.get(
   "/open-html/:id",
   trackHandler("html")
);

router.get(
   "/open-amp/:id",
   trackHandler("amp")
);

// HTML click tracking

router.get(
   "/click/:id",
   clickTracking
);

/* FORMS */

router.post(
   "/form-amp/:id",
   ampFormTracking
);

router.post(
   "/form-html/:id",
   htmlFormTracking
);

// analytic routes

router.get("/analytics", analyticsOverview);

// form route

router.get("/form/:id", async (req, res) => {

   console.log(req.query);

   const trackingId = req.params.id;

   const {
      subject,
      campaignName,
      campaignType,
      templateId,
      templateSlug
   } = req.query;

   try {
      const savedTemplate = templateId
         ? await AmpTemplate.findOne({
            _id: templateId,
            isActive: true
         })
         : templateSlug
            ? await AmpTemplate.findOne({
               slug: templateSlug,
               isActive: true
            })
            : null;

      if (savedTemplate?.formHtml) {
         const email = Buffer
            .from(trackingId, "base64")
            .toString();

         return res.send(
            renderTrackedFormTemplate({
               template: savedTemplate,
               trackingId,
               email,
               subject,
               campaignName,
               campaignType
            })
         );
      }

      return res.send(
         formTemplate(
            trackingId,
            subject,
            campaignName,
            campaignType
         )
      );
   } catch (err) {
      console.error("FORM TEMPLATE ERROR:", err);

      return res.send(
         formTemplate(
            trackingId,
            subject,
            campaignName,
            campaignType
         )
      );
   }

});


router.get("/unsubscribe/:id", unsubscribeHandler );



export default router;
