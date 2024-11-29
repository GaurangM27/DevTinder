const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
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

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
