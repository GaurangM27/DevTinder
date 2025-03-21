const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(process.env.URI);
};

module.exports = connectDb;
