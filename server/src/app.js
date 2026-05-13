import express from "express";

import trackingRoutes from "./routes/trackingRoutes.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

/* MIDDLEWARE */

app.use(express.json());

app.use(express.urlencoded({
   extended: true
}));

app.use(express.text());

app.set("trust proxy", true);

/* CUSTOM CORS */

app.use(corsMiddleware);

// email routes
app.use("/api", emailRoutes);

/* ROUTES */



app.use("/track", trackingRoutes);

/* HEALTH */

app.get("/", (req, res) => {
   res.send("Tracking Server Running");
});

export default app;