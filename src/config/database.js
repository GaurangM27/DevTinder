const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://gaurangmishra2712:meisGM2712@cluster0.9xohvjb.mongodb.net/devTinder"
  );
};

module.exports = connectDb;
