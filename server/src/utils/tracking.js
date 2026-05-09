export const generateTrackingId = (email) => {

   return Buffer
      .from(email)
      .toString("base64");

};