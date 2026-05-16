import mongoose from "mongoose";

const mailEventSchema = new mongoose.Schema({

  trackingId: String,

  email: String,

  event: String,

  messageId: String,

  render: {

    ip: String,

    country: String,

    city: String,

    browser: String,

    os: String,

    device: String,

    userAgent: String
  },

  payload: Object

}, {
  timestamps: true
});

export default mongoose.model(
  "MailEvent",
  mailEventSchema
);
