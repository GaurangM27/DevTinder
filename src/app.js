const express = require("express");

const app = express();

const User = require("./models/user");

const connectDb = require("./config/database");

app.use(express.json());

app.get("/user", async (req, res) => {
  const email = req.body.emailId;
  try {
    const user = await User.findOne({ emailId: email });

    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(404).send("User not found");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error while creating user");
  }
});

app.delete("/user", async (req, res) => {
  const email = req.body.email;
  try {
    await User.findOneAndDelete({ emailId: email });
    res.send("User deleted successfully");
  } catch (error) {
    res.status(404).send("User not found");
  }
});

app.patch("/user", async (req, res) => {
  const email = req.body.email;
  try {
    await User.findOneAndUpdate({ emailId: email }, { password: "meisGM2712" });
    res.send("User updated successfully");
  } catch (error) {
    res.status(404).send("User not found");
  }
});

connectDb()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server is running on this port 7777");
    });
  })
  .catch((err) => {
    console.log("Error while connecting to database");
  });
