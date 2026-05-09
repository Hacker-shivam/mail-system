const ampTemplate = (trackingId) => {
  const baseUrl = process.env.API_URL;

  return `
<!DOCTYPE html>
<html ⚡4email>

<head>
  <meta charset="utf-8">

  <script async src="https://cdn.ampproject.org/v0.js"></script>

  <script
    async
    custom-element="amp-form"
    src="https://cdn.ampproject.org/v0/amp-form-0.1.js">
  </script>

  <script
    async
    custom-template="amp-mustache"
    src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js">
  </script>

  <style amp4email-boilerplate>
    body {
      visibility: hidden;
    }
  </style>

  <style amp-custom>
    body {
      font-family: Arial;
      background: #f8fafc;
      padding: 20px;
    }

    .box {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #652394;
      text-align: center;
    }

    .input {
      width: 100%;
      padding: 12px;
      margin-top: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-sizing: border-box;
    }

    .btn {
      display: inline-block;
      padding: 14px 20px;
      margin-top: 20px;
      background: #178218;
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      cursor: pointer;
    }

    p {
      color: #333;
    }
  </style>
</head>

<body>

  <div class="box">

    <h2>🚀 Complete Your Application</h2>

    <p>Fill the form below and submit your details.</p>

    <form
      method="post"
      target="_top"
      action-xhr="${baseUrl}/track/form-amp/${trackingId}"
    >

      <input
        class="input"
        type="text"
        name="name"
        placeholder="Enter Your Name"
        required
      >

      <input
        class="input"
        type="email"
        name="email"
        placeholder="Enter Your Email"
        required
      >

      <input
        type="hidden"
        name="trackingId"
        value="${trackingId}"
      >

      <button class="btn" type="submit">
        Submit
      </button>

      <div submit-success>
        <template type="amp-mustache">
          <p style="color:green;margin-top:20px;">
            Form submitted successfully ✅
          </p>
        </template>
      </div>

      <div submit-error>
        <template type="amp-mustache">
          <p style="color:red;margin-top:20px;">
            Submission failed ❌
          </p>
        </template>
      </div>

    </form>

    <!-- AMP OPEN TRACKING -->
    <amp-img
      src="${baseUrl}/track/open-amp/${trackingId}"
      width="1"
      height="1"
      layout="fixed"
      alt=""
    >
    </amp-img>

  </div>

</body>
</html>
`;
};

export default ampTemplate;