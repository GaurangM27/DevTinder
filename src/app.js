const express = require("express");
const app = express();
const User = require("./models/user");
const connectDb = require("./config/database");
const { validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid email address");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    } else {
      res.send("Logged in successfully");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

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
  try {
    validateSignupData(req);

    const { password, firstName, lastName, emailId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error while creating user: " + error.message);
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

app.patch("/user/:userId", async (req, res) => {
  const user = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isValidUpdate = Object.keys(data).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );
    if (!isValidUpdate) {
      throw new Error("Invalid update");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot exceed 10");
    }
    await User.findByIdAndUpdate({ _id: user }, data, {});
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("Update Unsuccessful: " + error.message);
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
