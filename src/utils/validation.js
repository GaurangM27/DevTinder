const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Invalid Name");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong");
  }
};

module.exports = { validateSignupData };
