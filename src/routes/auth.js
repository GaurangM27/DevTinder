const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
//const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const email = require("../utils/sendMail");
const generateOtp = require("../utils/generateOtp");

const otpStore = new Map();

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
    //console.log(token);

    const BASE_URL =
      location.hostname === "localhost"
        ? "http://localhost:5173"
        : "https://devtinder.life";

    const resetLink = `${BASE_URL}/reset-password/${token}`;

    const emailSubject = "Password Reset Link";
    const emailBody = `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`;

    const emailRes = await email.run(emailID, emailSubject, emailBody);
    //console.log(emailRes); // for testing purpose, remove it in production
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
    //console.log(decoded);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("User not found");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    const newUser = await user.save();
    //console.log(newUser);
    res.send("Password reset successfully");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/send-otp", async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      throw new Error("Please enter an email address");
    }

    const otp = generateOtp();
    otpStore.set(emailId, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const toUserEmail = emailId;
    const emailSubject = "OTP Verification";
    const emailBody = `<h1>OTP Verification</h1>
    <p>Your OTP is: ${otp}</p>
    <p>This OTP will expire in 5 minutes.</p>`;

    const emailRes = await email.run(toUserEmail, emailSubject, emailBody);

    res.send("OTP sent to your email");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/verify-otp", (req, res) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      throw new Error("Please provide both email and OTP");
    }

    const storedOtp = otpStore.get(emailId);
    if (
      !storedOtp ||
      storedOtp.otp !== otp ||
      storedOtp.expiresAt < Date.now()
    ) {
      throw new Error("Invalid OTP or expired OTP");
    }

    otpStore.delete(emailId);
    res.send("OTP verified successfully");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = authRouter;
