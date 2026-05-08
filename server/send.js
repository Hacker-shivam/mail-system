import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ------------------ TRANSPORTER ------------------ */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS 
  }
});

// User email and tracking ID for testing

const userEmail = "rjha87744@gmail.com";
const trackingId = Buffer.from(userEmail).toString("base64");

// Amp email template with tracking links and form

const ampEmail = `
<!doctype html>
<html ⚡4email>
<head>
<meta charset="utf-8">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-form"
src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>

<style amp4email-boilerplate>body{visibility:hidden}</style>

<style amp-custom>
body{font-family:Arial;padding:20px}
h1{color:red}
.btn{background:#000;color:#fff;padding:10px 15px;border-radius:6px}
</style>

</head>

<body>

<h1>AMP EMAIL</h1>

<a class="btn"
href="${process.env.API_URL}/track/click/${trackingId}?url=https://google.com">
CLICK HERE
</a>

<img src="${process.env.API_URL}/track/open-amp/${trackingId}" width="1" height="1"/>

<form method="POST"
action-xhr="${process.env.API_URL}/track/form-amp/${trackingId}">

<input type="email" name="email" placeholder="Enter Email" />
<button class="btn" type="submit">SUBMIT</button>

<div submit-success>
<template type="amp-mustache">
Success!
</template>
</div>

</form>

</body>
</html>
`;

// HTML email template as fallback

const htmlFallback = `
<html>
<body style="font-family:Arial;padding:20px">

<h1 style="color:blue">HTML EMAIL</h1>

<a href="${process.env.API_URL}/track/click/${trackingId}?url=https://google.com"
style="background:black;color:white;padding:10px 15px;text-decoration:none">
CLICK HERE
</a>

<img src="${process.env.API_URL}/track/open-html/${trackingId}" width="1" height="1"/>

<form method="POST"
action="${process.env.API_URL}/track/form-html/${trackingId}">

<input type="email" name="email" placeholder="Enter Email" />
<button type="submit">SUBMIT</button>

</form>

</body>
</html>
`;

// Send test email on server start

try {
  const info = await transporter.sendMail({
    from: `"Tracker Test" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: "AMP + HTML Tracking Test",

    html: htmlFallback,
    amp: ampEmail,
    text: "Tracking Email"
  });

  console.log("EMAIL SENT:", info.messageId);

} catch (err) {
  console.error("EMAIL ERROR:", err);
}