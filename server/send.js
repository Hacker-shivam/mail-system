import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ------------------ TRANSPORTER ------------------ */

const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: Number(process.env.SMTP_PORT),

   secure: Number(process.env.SMTP_PORT) === 465,

   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
   }
});

/* ------------------ TEST USER ------------------ */

const userEmail = "saurabhsingh847101@gmail.com";

const trackingId = Buffer
   .from(userEmail)
   .toString("base64");

/* ------------------ AMP EMAIL TEMPLATE ------------------ */

const ampEmail = `
<!doctype html>
<html ⚡4email>

<head>

<meta charset="utf-8">

<script async
src="https://cdn.ampproject.org/v0.js">
</script>

<script async
custom-element="amp-form"
src="https://cdn.ampproject.org/v0/amp-form-0.1.js">
</script>

<style amp4email-boilerplate>
body{
   visibility:hidden
}
</style>

<style amp-custom>

body{
   font-family:Arial,sans-serif;
   background:#f4f4f4;
   padding:20px;
}

.container{
   max-width:500px;
   margin:auto;
   background:#ffffff;
   padding:25px;
   border-radius:10px;
}

h1{
   color:#111827;
}

p{
   color:#4b5563;
   line-height:1.6;
}

.btn{
   display:inline-block;
   background:#111827;
   color:#ffffff;
   padding:12px 20px;
   border-radius:6px;
   text-decoration:none;
   margin-top:15px;
}

.input{
   width:100%;
   padding:12px;
   margin-top:10px;
   border:1px solid #d1d5db;
   border-radius:6px;
   font-size:14px;
   box-sizing:border-box;
}

.submit-btn{
   background:#2563eb;
   color:white;
   border:none;
   padding:12px 18px;
   margin-top:15px;
   border-radius:6px;
   cursor:pointer;
   font-size:14px;
}

.success{
   color:green;
   margin-top:10px;
}

</style>

</head>

<body>

<div class="container">

<h1>Interactive AMP Email</h1>

<p>
This email supports:
</p>

<ul>
<li>Open Tracking</li>
<li>Click Tracking</li>
<li>AMP Form Submission</li>
</ul>

<a
class="btn"

href="${process.env.API_URL}/track/click/${trackingId}?url=https://google.com"

target="_blank">

Visit Google

</a>

<!-- OPEN TRACKING PIXEL -->

<img
src="${process.env.API_URL}/track/open-amp/${trackingId}"
width="1"
height="1"
/>

<!-- AMP FORM -->

<form

method="POST"

action-xhr="${process.env.API_URL}/track/form-amp/${trackingId}"

target="_top">

<input
class="input"
type="text"
name="name"
placeholder="Enter Your Name"
required
/>

<input
class="input"
type="email"
name="email"
placeholder="Enter Your Email"
required
/>

<input
class="input"
type="tel"
name="phone"
placeholder="Enter Phone Number"
/>

<button
class="submit-btn"
type="submit">

Submit Form

</button>

<div submit-success>

<template type="amp-mustache">

<div class="success">
Form Submitted Successfully!
</div>

</template>

</div>

<div submit-error>

<template type="amp-mustache">

<div style="color:red">
Submission Failed
</div>

</template>

</div>

</form>

</div>

</body>

</html>
`;

/* ------------------ HTML FALLBACK EMAIL ------------------ */

const htmlFallback = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8" />

<title>HTML Email</title>

</head>

<body
style="
font-family:Arial,sans-serif;
background:#f4f4f4;
padding:20px;
">

<div
style="
max-width:500px;
margin:auto;
background:#ffffff;
padding:25px;
border-radius:10px;
">

<h1 style="color:#111827">

HTML Email Fallback

</h1>

<p style="color:#4b5563">

This is the fallback version
for email clients that do not support AMP.

</p>

<a

href="${process.env.API_URL}/track/click/${trackingId}?url=https://google.com"

target="_blank"

style="
display:inline-block;
background:#111827;
color:#ffffff;
padding:12px 20px;
border-radius:6px;
text-decoration:none;
margin-top:15px;
">

Visit Google

</a>

<!-- OPEN TRACKING -->

<img
src="${process.env.API_URL}/track/open-html/${trackingId}"
width="1"
height="1"
/>

<br/><br/>

<!-- HTML FORM -->

<a

href="${process.env.API_URL}/track/click/${trackingId}?url=https://yourwebsite.com"

target="_blank"

style="
display:inline-block;
background:#2563eb;
color:white;
padding:14px 22px;
border-radius:8px;
text-decoration:none;
font-size:15px;
font-weight:bold;
margin-top:15px;
">

Open Website

</a>

</div>

</body>

</html>
`;

/* ------------------ SEND EMAIL ------------------ */

try {

   await transporter.verify();

   console.log("SMTP CONNECTED");

   const info = await transporter.sendMail({

      from: `"Tracker Test" <${process.env.SMTP_FROM}>`,

      to: userEmail,

      subject: "AMP + HTML Tracking Test",

      text: "Tracking Email",

      html: htmlFallback,

      amp: ampEmail

   });

   console.log(
      "EMAIL SENT:",
      info.messageId
   );

} catch (err) {

   console.error(
      "EMAIL ERROR:",
      err
   );

}