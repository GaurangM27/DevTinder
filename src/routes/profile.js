const express = require("express");
const profileRouter = express.Router();
const app = express();
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const validator = require("validator");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  try {
    const isValidUpdate = Object.keys(req.body).every((field) =>
      allowedEditFields.includes(field)
    );
    if (!isValidUpdate) {
      throw new Error("Invalid update fields");
    }
    const user = req.user;
    const updatedUser = Object.keys(req.body).forEach(
      (field) => (user[field] = req.body[field])
    );
    await user.save();
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("New password must be strong");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();
    res.send("Password updated successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = profileRouter;
