const ampTemplate = (trackingId, subject, campaignName, campaignType) => {
  const baseUrl = process.env.API_URL;

  return `<!DOCTYPE html>
<html ⚡4email>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
  <script async custom-element="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>

  <style amp4email-boilerplate>body{visibility:hidden}</style>

  <style amp-custom>
    body { font-family: Arial; background:#f8fafc; margin:0; }
    .container { max-width:600px; margin:auto; background:#fff; }
    .form-box { padding:20px; border:3px solid #652394; border-radius:10px; margin:20px; }
    .input-style { width:100%; padding:10px; margin-top:6px; border:1px solid #ccc; border-radius:8px; }
    .button { margin-top:20px; padding:12px; width:100%; border:none; border-radius:30px; background:#178218; color:#fff; font-size:16px; }
    h2 { color:#652394; text-align:center; }
    .question { margin-top:12px; font-size:14px; }
    .success { text-align:center; color:#652394; padding:20px; }
  </style>
</head>

<body>

<div class="container">

  <a href="https://tn.btrkr.com/clicks/amp/...">
    <amp-img
      src="https://img.mmdocdn.com/mailmodo/image/upload/ar_946:1600,c_crop/v1756704504/editor/p/62dc8626-eafe-4c68-a935-861517fb9628/b20f300699305eadf65f9988cb020bb2_cd9fdw.jpg"
      width="600"
      height="400"
      layout="responsive">
    </amp-img>
  </a>

  <div class="form-box">

    <h2>Check Your Eligibility</h2>

    <form method="post"
      action-xhr="${baseUrl}/track/form-amp/${trackingId}"
      on="submit-success:form.reset"
      target="_top">

      <div class="question">
        <strong>Company Name *</strong>
      </div>
      <input class="input-style" type="text" name="company" required>

      <div class="question">
        <strong>Mobile No *</strong>
      </div>
      <input class="input-style" type="tel" name="mobile" required>

      <input type="hidden" name="trackingid" value="${trackingId}">
      <input type="hidden" name="subject" value="${subject}">
      <input type="hidden" name="campaignName" value="${campaignName}">
      <input type="hidden" name="campaignType" value="${campaignType}">

      <button class="button" type="submit">
        Apply Now
      </button>

      <div submit-success>
        <template type="amp-mustache">
          <div class="success">
            <strong>Thank you for submitting!</strong>
          </div>
        </template>
      </div>

      <div submit-error>
        <template type="amp-mustache">
          <div class="success" style="color:red;">
            Submission failed. Try again.
          </div>
        </template>
      </div>

    </form>
  </div>

  <div style="text-align:center; font-size:12px; margin-top:10px;">
    <a href="${baseUrl}/track/unsubscribe/${trackingId}">Unsubscribe</a>
  </div>

  <amp-img
    src="${baseUrl}/track/open-amp/${trackingId}?campaignName=${encodeURIComponent(campaignName)}&campaignType=${encodeURIComponent(campaignType)}&subject=${encodeURIComponent(subject)}"
    width="1"
    height="1"
    layout="fixed">
  </amp-img>

</div>

</body>
</html>`;
};

export default ampTemplate;