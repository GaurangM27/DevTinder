const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
//const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const email = require("../utils/sendMail");

//app.use(express.json());
//app.use(cookieParser());

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { password, firstName, lastName, emailId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      about: req.body.about,
      skills: req.body.skills,
      photoUrl: req.body.photoUrl,
    });
    const newUser = await user.save();
    const token = await newUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: true, // set to true if using HTTPS
      sameSite: "none",
    });
    res.json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(400).send("Error while creating user: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid email address");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true, // set to true if using HTTPS
        sameSite: "none",
      });
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.send("Logged out successfully");
});

authRouter.post("/forget-password", async (req, res) => {
  try {
    const emailID = req.body.email;
    const user = await User.findOne({ emailId: emailID });
    if (!user) {
      throw new Error("User not found");
    }
    const token = await jwt.sign({ _id: user._id }, process.env.PRIVATE_KEY, {
      expiresIn: "10m",
    });
    console.log(token);
    const emailSubject = "Password Reset Link";
    const emailBody = `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`;

    const emailRes = await email.run(emailID, emailSubject, emailBody);
    console.log(emailRes); // for testing purpose, remove it in production
    res.send("Password reset link sent to your email");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    const decoded = await jwt.verify(token, process.env.PRIVATE_KEY);
    if (!decoded) {
      throw new Error("Token expired or invalid");
    }
    console.log(decoded);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("User not found");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    const newUser = await user.save();
    console.log(newUser);
    res.send("Password reset successfully");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = authRouter;
