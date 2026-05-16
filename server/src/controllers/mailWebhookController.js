import MailEvent from "../models/MailEvent.js";
import getRenderData from "../utils/renderData.js";

const parseWebhookBody = (body) => {
  if (typeof body !== "string") {
    return body && typeof body === "object" ? body : {};
  }

  const trimmed = body.trim();

  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return Object.fromEntries(new URLSearchParams(trimmed));
  }
};

const getValue = (source, paths) => {
  for (const path of paths) {
    const value = path
      .split(".")
      .reduce((current, key) => current?.[key], source);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const normalizeWebhookEvent = (body, req) => {
  const headers = body.headers || body.mail?.headers || body["message-headers"];

  const trackingHeader = Array.isArray(headers)
    ? headers.find((header) => {
        const name = Array.isArray(header) ? header[0] : header?.name;
        return String(name).toLowerCase() === "x-tracking-id";
      })
    : null;

  const trackingHeaderValue = Array.isArray(trackingHeader)
    ? trackingHeader[1]
    : trackingHeader?.value;

  return {
    trackingId:
      getValue(body, [
        "trackingId",
        "tracking_id",
        "metadata.trackingId",
        "metadata.tracking_id",
        "custom_args.trackingId",
        "custom_args.tracking_id",
        "headers.x-tracking-id",
        "headers.X-Tracking-Id"
      ]) ||
      trackingHeaderValue ||
      req.query.trackingId ||
      req.query.tracking_id,

    email: getValue(body, [
      "email",
      "recipient",
      "to",
      "Recipient",
      "event-data.recipient",
      "mail.destination.0"
    ]),

    event: getValue(body, [
      "event",
      "type",
      "status",
      "RecordType",
      "eventType",
      "notificationType",
      "event-data.event"
    ]),

    messageId: getValue(body, [
      "messageId",
      "message_id",
      "message-id",
      "MessageID",
      "sg_message_id",
      "mail.messageId",
      "event-data.message.headers.message-id"
    ])
  };
};

export const mailDeliveryWebhook =
async (req, res) => {

  try {

    const receivedAt = new Date().toISOString();

    console.error("MAIL WEBHOOK HIT:", {
      receivedAt,
      method: req.method,
      path: req.originalUrl,
      body: req.body
    });

    const parsedBody = parseWebhookBody(req.body);

    const events = Array.isArray(parsedBody)
      ? parsedBody
      : [parsedBody];

    const render = getRenderData(req);

    const docs = events.map((body) => {
      const normalized = normalizeWebhookEvent(body, req);

      return {
        ...normalized,
        render,
        payload: body
      };
    });

    await MailEvent.insertMany(docs);

    return res.status(200).json({

      success: true,

      message: "Webhook Event Saved",

      saved: docs.length,

      debugFrom: "local-mailWebhookController",

      receivedAt

    });

  } catch (err) {

    console.error("WEBHOOK ERROR:", err);

    return res.status(500).json({

      success: false,

      message: "Webhook Error"

    });
  }
};
