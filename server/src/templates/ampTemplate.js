const htmlTemplate = (trackingId) => {
  const baseUrl = process.env.API_URL;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
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

    .btn {
      display: inline-block;
      padding: 14px 20px;
      margin-top: 20px;
      background: #178218;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 16px;
    }

    p {
      color: #333;
    }
  </style>
</head>

<body>

  <div class="box">

    <h2>🚀 Complete Your Application</h2>

    <p>Click below to open the form and submit your details.</p>

    <!-- CLICK OPENS FORM PAGE -->
    <a
      class="btn"
      href="${baseUrl}/form/${trackingId}"
      target="_blank"
    >
      Open Form
    </a>

    <!-- TRACKING PIXEL -->
    <img
      src="${baseUrl}/track/open-html/${trackingId}"
      width="1"
      height="1"
      style="display:none"
    />

  </div>

</body>
</html>
`;
};

export default htmlTemplate;