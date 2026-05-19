import mongoose from "mongoose";

const ampTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },

    subject: String,

    html: {
      type: String,
      required: true
    },

    amp: {
      type: String,
      default: ""
    },

    text: {
      type: String,
      default: "Your email client does not support HTML or AMP emails."
    },

    variables: {
      type: [String],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("AmpTemplate", ampTemplateSchema);
