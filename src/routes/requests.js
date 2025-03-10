const express = require("express");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Connection = require("../models/connection");
const User = require("../models/user");
const email = require("../utils/sendMail");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      // console.log(fromUserId, toUserId);

      if (!(status === "interested" || status === "ignored")) {
        throw new Error("Invalid status");
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("User not found");
      }

      const isConnectionPresent = await Connection.find({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isConnectionPresent.length > 0) {
        throw new Error("Connection already exists");
      }

      const newConnection = new Connection({ fromUserId, toUserId, status });
      await newConnection.save();

      const tosendEmail = toUser.emailId;
      const emailSubject = "New Connection Request";
      const emailBody = `You have a new connection request from ${user.firstName} ${user.lastName}. Please login to DevTinder to view the request.`;

      const emailRes = await email.run(tosendEmail, emailSubject, emailBody);
      //console.log(emailRes); // for testing purpose, remove it in production

      res.json({
        message: "Profile is marked as " + status,
        data: newConnection,
      });
    } catch (error) {
      res.status(400).send("Error creating connection: " + error.message);
    }
  }
);

requestsRouter.post(
  "/request/review/:status/:fromUserId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const fromUserId = req.params.fromUserId;
      const status = req.params.status;

      if (!(status === "accepted" || status === "rejected")) {
        throw new Error("Invalid status");
      }

      const connection = await Connection.findOne({
        fromUserId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connection) {
        throw new Error("No pending connection found");
      }
      connection.status = status;
      await connection.save();
      res.json({ message: "Connection marked as" + connection.status });
    } catch (error) {
      res.status(404).send("Error reviewing connection: " + error.message);
    }
  }
);

module.exports = requestsRouter;
