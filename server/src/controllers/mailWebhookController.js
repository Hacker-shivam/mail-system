import Tracking from "../models/Tracking.js";
import getRenderData from "../utils/renderData.js";

export const mailDeliveryWebhook =
async (req, res) => {

  try {

    console.log("WEBHOOK:", req.body);

    const event =
      req.body.event ||
      req.body.type;

    const email =
      req.body.email ||
      req.body.recipient;

    const messageId =
      req.body.messageId ||
      req.body["message-id"];

    const trackingId =
      req.body.trackingId ||
      req.body.headers?.["x-tracking-id"];

    await Tracking.create({

      trackingId,

      email,

      eventType: event,

      messageId,

      render: getRenderData(req),

      payload: req.body,

      createdAt: new Date()

    });

    return res.status(200).json({

      success: true,

      message: "Webhook Event Saved"

    });

  } catch (err) {

    console.error("WEBHOOK ERROR:", err);

    return res.status(500).json({

      success: false,

      message: "Webhook Error"

    });
  }
};