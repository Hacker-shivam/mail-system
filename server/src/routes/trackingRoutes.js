import express from "express";

import {
   trackHandler,
   clickTracking,
   ampFormTracking,
   htmlFormTracking
} from "../controllers/trackingController.js";

import { analyticsOverview } from "../controllers/analyticsController.js";
import formTemplate from "../templates/formTemplate.js";

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

/* CLICK */

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

router.get("/form/:id", (req, res) => {

  const trackingId = req.params.id;

  res.send(formTemplate(trackingId));

});




export default router;