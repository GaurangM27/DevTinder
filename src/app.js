require("dotenv").config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const connectDb = require("./config/database");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/requests");
const userRouter = require("./routes/user");
const cors = require("cors");
const scheduleTask = require("./utils/cronJob");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

scheduleTask();

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

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
