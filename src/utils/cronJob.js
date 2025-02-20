const cron = require("node-cron");
const Connection = require("../models/connection");
const email = require("./sendMail");
require("dotenv").config();

const scheduleTask = () => {
  cron.schedule("00 14 * * *", async () => {
    const yesterdayStartTime = new Date();
    try {
      const reciepentList = await Connection.find({
        status: "interested",
      })
        .populate("toUserId", "emailId")
        .select("toUserId");

      const uniqueReciepentEmail = [
        ...new Set(reciepentList.map((rec) => rec.toUserId.emailId)),
      ];

      // Send email notification to unique recipients with yesterday's connection data
      const testEmail = "gaurangm2712@gmail.com";

      uniqueReciepentEmail.forEach(async (emailid) => {
        console.log(process.env.AWS_ACCESS_KEY);
        // Send email notification code here
        await email.run(testEmail);
        console.log(
          `Sending email to ${emailid} with yesterday's connection data`
        );
      });

      console.log(uniqueReciepentEmail);
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = scheduleTask;
