import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({

    trackingId: String,

    email: String,

    campaignName: String,

    campaignType: String,

    emailType: {
        type: String,
        enum: ["html", "amp"]
    },

    eventType: {
        type: String,
        enum: [
            "open",
            "click",
            "form_submit"
        ]
    },

     firstOpenAt: Date,
     lastOpenAt: Date,
     formSubmitAt: Date,

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
});

export default mongoose.model(
    "Tracking",
    trackingSchema
);