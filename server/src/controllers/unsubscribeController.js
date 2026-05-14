import Tracking from "../models/Tracking.js";

export const unsubscribeHandler = async (req, res) => {

  try {

    const trackingId = req.params.id;

    const email = Buffer
      .from(trackingId, "base64")
      .toString();

    await Tracking.findOneAndUpdate(

      { email },

      {
        isSubscribed: false,

        eventType: "unsubscribe",

        unsubscribedAt: new Date()
      },

      {
        new: true
      }
    );

    return res.send(`

      <h2>
        You have been unsubscribed successfully
      </h2>

    `);

  } catch (err) {

    console.error(err);

    return res.status(500).send(
      "Unsubscribe Error"
    );
  }
};