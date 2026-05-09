const corsMiddleware = (req, res, next) => {

   res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
   );

   res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
   );

   res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
   );

   res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      process.env.API_URL
   );

   res.setHeader(
      "Access-Control-Expose-Headers",
      "AMP-Access-Control-Allow-Source-Origin"
   );

   if (req.method === "OPTIONS") {
      return res.sendStatus(200);
   }

   next();
};

export default corsMiddleware;