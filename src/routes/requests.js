const express = require("express");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const app = express();

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " send you a connection request");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = requestsRouter;
