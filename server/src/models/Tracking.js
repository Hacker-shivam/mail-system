import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(

  {

    trackingId: String,

    email: String,

    isSubscribed: {
      type: Boolean,
      default: true,
    },

    campaignName: String,

    campaignType: String,

    subject: String,

    emailType: {

      type: String,

      enum: ["html", "amp"]

    },

    messageId: String,

    // Mail delivery status (filled by mail provider webhooks)
    deliveryStatus: {
      type: String,
      enum: [
        "delivered",
        "bounced",
        "dropped",
        "deferred",
        "failed",
        "accepted",
        "rejected",
        null
      ],
      default: null
    },

    deliveryAt: {
      type: Date,
      default: null
    },

    deliveryResponse: {
      type: String,
      default: null
    },

    eventType: {

      type: String,

      enum: [
        "open",
        "click",
        "form_submit",
        "unsubscribe"
      ]
    },

    openedAt: {
      type: Date,
      default: null
    },

    clickedAt: {
      type: Date,
      default: null
    },

    formSubmitAt: {
      type: Date,
      default: null
    },

    unsubscribedAt: {
      type: Date,
      default: null
    },

    render: {

      ip: String,

      country: String,

      city: String,

      browser: String,

      os: String,

      device: String,

      userAgent: String
    },

    clickedUrl: String,

    formSubmission: {

      type: Object,

      default: {}
    }

  },

  {
    timestamps: true
  }

);

export default mongoose.model(
  "Tracking",
  trackingSchema
);