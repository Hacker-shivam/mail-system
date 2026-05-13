import sendTrackingEmail
from "../services/emailService.js";

export const sendEmailController =
async (req, res) => {

   try {

      const {
         email,
         campaignName,
         campaignType
      } = req.body;

      if (!email) {

         return res.status(400).json({
            success: false,
            message: "Email is required"
         });

      }

      await sendTrackingEmail(
         email,
         campaignName,
         campaignType
      );

      res.json({
         success: true,
         message: "Tracking email sent"
      });

   } catch (error) {

      console.log(error);

      res.status(500).json({
         success: false,
         error: error.message
      });

   }

};