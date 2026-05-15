import express from "express";

import {
  mailDeliveryWebhook
} from "../controllers/mailWebhookController.js";

const router = express.Router();

router.post(
  "/maildelivery-status",
  mailDeliveryWebhook
);

export default router;