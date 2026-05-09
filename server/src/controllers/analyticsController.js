import Tracking from "../models/Tracking.js";

export const analyticsOverview = async (req, res) => {

   try {

      /* TOTAL UNIQUE USERS */

      const totalUsers = await Tracking.distinct("email");

      /* TOTAL OPENS */

      const totalOpens = await Tracking.countDocuments({
         eventType: "open"
      });

      /* TOTAL CLICKS */

      const totalClicks = await Tracking.countDocuments({
         eventType: "click"
      });

      /* TOTAL FORM SUBMISSIONS */

      const totalForms = await Tracking.countDocuments({
         eventType: "form_submit"
      });

    //   HTML OPENS

      const htmlOpens = await Tracking.countDocuments({
         emailType: "html"
      });

    //   AMP OPENS

      const ampOpens = await Tracking.countDocuments({
         emailType: "amp"
      });

      /* UNIQUE OPEN USERS */

      const uniqueOpenUsers = await Tracking.distinct(
         "email",
         {
            eventType: "open"
         }
      );

      /* UNIQUE CLICK USERS */

      const uniqueClickUsers = await Tracking.distinct(
         "email",
         {
            eventType: "click"
         }
      );

      /* RESPONSE */

      return res.json({

         success: true,

         analytics: {

            totalUsers: totalUsers.length,

            totalOpens,

            totalClicks,

            ampOpens,

            htmlOpens,

            totalForms,

            uniqueOpenUsers: uniqueOpenUsers.length,

            uniqueClickUsers: uniqueClickUsers.length,

            openRate:
               (
                  uniqueOpenUsers.length /
                  totalUsers.length
               ) * 100 || 0,

            clickRate:
               (
                  uniqueClickUsers.length /
                  totalUsers.length
               ) * 100 || 0
         }

      });

   } catch (err) {

      console.error(err);

      return res.status(500).json({

         success: false,

         message: "Analytics Error"

      });

   }

};

