import mongoose from "mongoose";

const TrackingSchema = new mongoose.Schema(
  {
    // =====================
    // USER INFO
    // =====================

    trackingId: String,
    email: String,

    // =====================
    // EVENT INFO
    // =====================

    eventType: String, 
    // open | click | form_submit | render_detected

    emailType: String,
    // amp | html

    // =====================
    // RENDER TRACKING 
    // =====================

    render: {
      type: {
        type: String,
        enum: ["amp", "html", "unknown"],
      },

      detectedVia: String,
      // amp_form | pixel | fallback | header_guess

      confidence: {
        type: Number,
        default: 0,
      },

      detectedAt: {
        type: Date,
        default: Date.now,
      }
    },

    // =====================
    // DEVICE INFO
    // =====================

    ip: String,
    country: String,
    city: String,
    browser: String,
    os: String,
    device: String,
    userAgent: String,

    // =====================
    // CLICK INFO
    // =====================

    clickedUrl: String,

    // =====================
    // FORM SUBMISSION
    // =====================

    formSubmission: {
      submitted: {
        type: Boolean,
        default: false
      },

      formType: String,
      // amp | html

      submittedAt: Date,
      formData: Object
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.model("Tracking", TrackingSchema);