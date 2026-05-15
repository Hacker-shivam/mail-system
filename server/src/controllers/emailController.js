import sendTrackingEmail
from "../services/emailService.js";

export const sendEmailController =
async (req, res) => {

   try {

      const {
         email,
         subject,
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
         subject,
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

export const thankYou = async (req, res) => {

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Thank You</title>

      <style>
        body{
          font-family:Arial;
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
          background:#f8fafc;
          margin:0;
        }

        .box{
          background:white;
          padding:40px;
          border-radius:16px;
          text-align:center;
          box-shadow:0 4px 20px rgba(0,0,0,0.1);
        }

        h1{
          color:#178218;
        }
      </style>
    </head>

    <body>

      <div class="box">

        <h1>Thank You!</h1>

        <p>Your form has been submitted successfully.</p>

      </div>

    </body>
    </html>
  `);

}