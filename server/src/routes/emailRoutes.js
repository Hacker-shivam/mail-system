import express from "express";

import { sendEmailController }
from "../controllers/emailController.js";
import { thankYou } from "../controllers/emailController.js";

const router = express.Router();

router.post(
   "/send-email",
   sendEmailController
);

app.get("/submit/thank-you", thankYou );

export default router;