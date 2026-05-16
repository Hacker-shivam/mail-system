import MailEvent from "../models/MailEvent.js";
import getRenderData from "../utils/renderData.js";

export const mailDeliveryWebhook =
async (req, res) => {

  try {

    console.log("WEBHOOK:", req.body);

    const body =
      typeof req.body === "object" && req.body !== null
        ? req.body
        : {};

    const event =
      body.event ||
      body.type ||
      body.status;

    const email =
      body.email ||
      body.recipient ||
      body.to;

    const messageId =
      body.messageId ||
      body.message_id ||
      body["message-id"];

    const trackingId =
      body.trackingId ||
      body.tracking_id ||
      body.headers?.["x-tracking-id"] ||
      body.headers?.["X-Tracking-Id"];

    await MailEvent.create({

      trackingId,

      email,

      event,

      messageId,

      render: getRenderData(req),

      payload: body

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
