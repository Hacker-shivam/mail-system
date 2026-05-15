import mongoose from "mongoose";

const mailEventSchema = new mongoose.Schema({

  trackingId: String,

  email: String,

  event: String,

  messageId: String,

  payload: Object

}, {
  timestamps: true
});

export default mongoose.model(
  "MailEvent",
  mailEventSchema
);