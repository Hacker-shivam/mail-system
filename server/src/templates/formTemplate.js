const formTemplate = (trackingId) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Submit Form</title>
    <style>
      body{
        font-family:Arial;
        background:#f8fafc;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
      }
      .card{
        width:400px;
        background:white;
        padding:20px;
        border-radius:10px;
        border:2px solid #652394;
      }
      input{
        width:100%;
        padding:10px;
        margin-top:10px;
        border:1px solid #ccc;
        border-radius:6px;
      }
      button{
        width:100%;
        margin-top:15px;
        padding:12px;
        background:#178218;
        color:white;
        border:none;
        border-radius:50px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Submit Details</h2>
      <form method="POST" action="${process.env.API_URL}/track/form-html/${trackingId}">
        <input
          type="email"
          name="email"
          placeholder="Enter Gmail"
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Enter Company"
          required
        />
        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  </body>
  </html>
`;

export default formTemplate;