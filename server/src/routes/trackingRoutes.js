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

router.get("/form/:id", (req, res) => {

   console.log(req.query);

   const trackingId = req.params.id;

   const {
      campaignName,
      campaignType
   } = req.query;

   res.send(
      formTemplate(
         trackingId,
         campaignName,
         campaignType
      )
   );

});


router.get("/unsubscribe/:id", unsubscribeHandler );



export default router;