const mongoose = require("mongoose");
const validator = require("validator");

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 20,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password must be strong");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value.toLowerCase())) {
          throw new Error("Invalid gender value");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1731388831~exp=1731392431~hmac=edb5fa8fc455654e037f638b99e098f44ee394eed239e53fe4af97ef29bf580b&w=740",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL format");
        }
      },
    },
    about: {
      type: String,
      default: "This is the about section",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userModel);

module.exports = User;
