const express = require("express");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Connection = require("../models/connection");
const User = require("../models/user");
const app = express();

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
      res.json({
        message: "Profile is marked as " + status,
        data: newConnection,
      });
    } catch (error) {
      res.status(400).send("Error creating connection: " + error.message);
    }
  }
);

module.exports = requestsRouter;
