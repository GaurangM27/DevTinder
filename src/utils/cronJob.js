const cron = require("node-cron");
const date = require("date-and-time");
const Connection = require("../models/connection");
const email = require("./sendMail");

const cronJobs = () => {
  cron.schedule("15 14 * * *", async () => {
    try {
      const receiverList = await Connection.find({
        status: "interested",
      })
        .populate("toUserId", "emailId")
        .select("toUserId");

      const receiverMails = [
        ...new Set(receiverList.map((user) => user.toUserId.emailId)),
      ];

      console.log("Unique receiver emails: ", receiverMails);

      const testMail = "gaurangm2712@gmail.com";

      const res = await Promise.all(
        receiverMails.map(async (mail) => {
          try {
            return await email.run(testMail);
          } catch (error) {
            console.error(`Error in sending email to ${mail} :`, error);
            return { success: false, email: mail, error: error.message };
          }
        })
      );
      console.log(res);
    } catch (error) {
      console.error("Error in scheduled job: ", error);
    }
  });
};

module.exports = cronJobs;
