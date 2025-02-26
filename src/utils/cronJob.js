const cron = require("node-cron");
const Connection = require("../models/connection");
const email = require("./sendMail");
const { subDays, startOfDay, endOfDay } = require("date-fns");

const scheduleTask = () => {
  cron.schedule("* 8 * * *", async () => {
    const now = new Date();
    const yesterday = subDays(new Date(), 1);
    const yesterdayStartTime = startOfDay(yesterday);
    const yesterdayEndTime = endOfDay(yesterday);
    console.log(yesterday, yesterdayEndTime, yesterdayStartTime);
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
      const emailSubject = "Pending Connection Requests";
      const emailBody =
        "You have pending connection requests from yesterday. Please login to DevTinder to view the requests.";

      uniqueReciepentEmail.forEach(async (emailid) => {
        // Send email notification code here
        await email.run(emailid, emailSubject, emailBody);
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
