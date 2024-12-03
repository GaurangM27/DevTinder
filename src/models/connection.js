const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Connection to User Schema
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["interested", "ignored", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.pre("save", function (next) {
  // Check if from user id and to user id are same
  const connection = this;
  if (connection.fromUserId.equals(connection.toUserId)) {
    throw new Error("Cannot send connection to yourself");
  }
  next();
});

/**
 * Creates a compound index on the connection collection
 * @description Defines an ascending index on fromUserId and toUserId fields
 * to optimize queries that search by these user reference fields
 * @index {fromUserId: 1, toUserId: 1} - Compound index where 1 indicates ascending order
 */
connectionSchema.index({ fromUserId: 1, toUserId: 1 });

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
