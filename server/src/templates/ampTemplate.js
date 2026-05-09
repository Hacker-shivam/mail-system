const ampTemplate = (trackingId) => {
  const baseUrl = process.env.API_URL; // Ensure this starts with https://

  return `
<!doctype html>
<html ⚡4email data-css-strict>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>

  <!-- Required for forms -->
  <script async custom-element="amp-form"
    src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>

  <!-- Required for success/error messages -->
  <script async custom-template="amp-mustache"
    src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>

  <style amp4email-boilerplate>
    body { visibility: hidden; }
  </style>

  <style amp-custom>
    body { font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; }
    .box { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; }
    .input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; box-sizing: border-box; }
    .btn { padding: 14px; background-color: #22c55e; color: white; border: none; cursor: pointer; width: 100%; font-weight: bold; }
    .success-msg { color: #16a34a; font-weight: bold; }
    .error-msg { color: #dc2626; font-weight: bold; }
  </style>
</head>

<body>
  <div class="box">
    <h2>Complete Your Application</h2>

    <form method="post"
      action-xhr="${baseUrl}/track/form-amp/${trackingId}">

      <label for="name">Name</label>
      <input class="input" type="text" name="name" id="name" required>
      
      <label for="email">Email</label>
      <input class="input" type="email" name="email" id="email" required>

      <input type="hidden" name="trackingId" value="${trackingId}">

      <button class="btn" type="submit">Submit Application</button>

      <div submit-success>
        <template type="amp-mustache">
          <p class="success-msg">Success! Your application has been received. ✅</p>
        </template>
      </div>

      <div submit-error>
        <template type="amp-mustache">
          <p class="error-msg">Submission failed. Please try again or visit our website. ❌</p>
        </template>
      </div>
    </form>

    <!-- Corrected tracking pixel for AMP -->
    <amp-img src="${baseUrl}/track/open-amp/${trackingId}" 
             width="1" 
             height="1" 
             layout="fixed"
             alt=""></amp-img>
  </div>
</body>
</html>
`;
};

export default ampTemplate;