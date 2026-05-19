import Tracking from "../models/Tracking.js";

export const unsubscribeHandler = async (req, res) => {

  try {

    const trackingId = req.params.id;

    const tracking = await Tracking.create(

      { trackingId },

      {
        isSubscribed: false,
        eventType: "unsubscribe",
        unsubscribedAt: new Date()
      },

      {
        new: true
      }
    );

    if (!tracking) {

      return res.status(404).send(`

        <h2>
          Tracking record not found
        </h2>

      `);
    }

    console.log("UNSUBSCRIBED:", tracking);

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