const express = require("express");
const Connection = require("../models/connection");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

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

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 1;
    limit = limit > 50 ? 50 : limit;
    const calSkip = (skip - 1) * limit;

    const loggedInUser = req.user;

    const usersToShow = await Connection.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .select("fromUserId toUserId status")
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");

    const excludeIds = new Set();

    usersToShow.forEach((user) => {
      excludeIds.add(user.fromUserId._id.toString());
      excludeIds.add(user.toUserId._id.toString());
    });

    excludeIds.add(loggedInUser._id.toString());

    const users = await User.find({
      _id: { $nin: Array.from(excludeIds) },
    })
      .select("firstName lastName age gender about skills photoUrl")
      .skip(calSkip)
      .limit(limit);

    //console.log(users);

    res.send(users);
  } catch (err) {
    res.status(400).send("Error fetching user feed: " + err.message);
  }
});

module.exports = userRouter;
