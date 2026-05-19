import express from "express";

import trackingRoutes from "./routes/trackingRoutes.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import emailRoutes from "./routes/emailRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";

const app = express();

/* MIDDLEWARE */

app.use(express.json({
   limit: "5mb"
}));

app.use(express.urlencoded({
   extended: true,
   limit: "5mb"
}));

app.use(express.text({
   limit: "5mb"
}));

app.set("trust proxy", true);

/* CUSTOM CORS */

app.use(corsMiddleware);

// email routes
app.use("/api", emailRoutes);

// template routes
app.use("/api/templates", templateRoutes);

app.use("/track", trackingRoutes);

/* HEALTH */

app.get("/", (req, res) => {
   res.send("Tracking Server Running");
});

export default app;
