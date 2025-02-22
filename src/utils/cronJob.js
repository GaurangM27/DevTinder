const cron = require("node-cron");
const Connection = require("../models/connection");
const email = require("./sendMail");
const date = require("date-and-time");

const scheduleTask = () => {
  cron.schedule("* 8 * * *", async () => {
    const now = new Date();
    const yesterday = date.addDays(now, -1);
    const yesterdayStartTime = new Date(yesterday);
    yesterdayStartTime.setHours(0, 0, 0, 0);
    const yesterdayEndTime = new Date(now);
    yesterdayEndTime.setHours(0, 0, 0, 0);
    try {
      const reciepentList = await Connection.find({
        status: "interested",
        createdAt: { $gte: yesterdayStartTime, $lt: yesterdayEndTime },
      })
        .populate("toUserId", "emailId")
        .select("toUserId");

      const uniqueReciepentEmail = [
        ...new Set(reciepentList.map((rec) => rec.toUserId.emailId)),
      ];

      // Send email notification to unique recipients with yesterday's connection data
      const testEmail = "gaurangm2712@gmail.com";

      uniqueReciepentEmail.forEach(async (emailid) => {
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
