import Tracking from "../models/Tracking.js";
import MailEvent from "../models/MailEvent.js";
import getRenderData from "../utils/renderData.js";

export const mailDeliveryWebhook = async (req, res) => {

  try {

    console.log("========== WEBHOOK RECEIVED ==========");
    console.log(JSON.stringify(req.body, null, 2));

    // Detect event type
    const event =
      req.body.event ||
      req.body.type ||
      req.body.eventType ||
      "unknown";

    // Detect recipient email
    const email =
      req.body.email ||
      req.body.recipient ||
      req.body.to ||
      null;

    // Detect message ID
    const messageId =
      req.body.messageId ||
      req.body["message-id"] ||
      req.body.message_id ||
      null;

    // Detect tracking ID
    const trackingId =
      req.body.trackingId ||
      req.body.headers?.["x-tracking-id"] ||
      req.body["x-tracking-id"] ||
      null;

    // SMTP response / bounce reason
    const response =
      req.body.response ||
      req.body.reason ||
      req.body.description ||
      req.body.error ||
      null;

    // Save raw mail event
    const mailEvent = await MailEvent.create({
      trackingId,
      email,
      event,
      messageId,
      payload: req.body
    });

    console.log("MAIL EVENT SAVED:", mailEvent._id);

    // Try to update existing Tracking document with delivery status
    const query = trackingId
      ? { trackingId }
      : messageId
      ? { messageId }
      : email
      ? { email }
      : null;

    if (query) {
      const update = {
        deliveryStatus: (event || "").toString().toLowerCase(),
        deliveryResponse: response,
        deliveryAt: new Date()
      };

      const updated = await Tracking.findOneAndUpdate(query, { $set: update }, { new: true });

      if (updated) console.log("TRACKING UPDATED:", updated._id);
      else console.log("No matching Tracking document found for webhook.");
    }

    return res.status(200).json({ success: true, message: "Webhook Event Saved" });

  } catch (err) {

    console.error("========== WEBHOOK ERROR ==========");

    console.error(err);

    return res.status(500).json({

      success: false,

      message: "Webhook Error"

    });
  }
};