const validateSignupData = (req) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Invalid Name");
  }
};

module.exports = { validateSignupData };
