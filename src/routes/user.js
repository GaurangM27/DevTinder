const express = require("express");
const Connection = require("../models/connection");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { connection } = require("mongoose");

userRouter.get("/user/requests/pending", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const pendingRequests = await Connection.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName age gender photoUrl about skills"
    );

    res.json(pendingRequests);
  } catch (error) {
    res.status(400).send("Error fetching pending requests: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await Connection.find({
      $and: [
        {
          $or: [
            { fromUserId: loggedInUser._id },
            { toUserId: loggedInUser._id },
          ],
        },
        { status: "accepted" },
      ],
    })
      .populate(
        "fromUserId",
        "firstName lastName photoUrl age gender about skills"
      )
      .populate(
        "toUserId",
        "firstName lastName photoUrl age gender about skills"
      );

    const data = connections.map((connection) => {
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.send(data);
  } catch (error) {
    res.status(400).send("Error fetching connections: " + error.message);
  }
});
module.exports = userRouter;
