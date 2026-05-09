import dotenv from "dotenv";

import sendTrackingEmail
from "./src/services/emailService.js";

dotenv.config();

const userEmail ="saurabhsingh847101@gmail.com" ;

sendTrackingEmail(userEmail);