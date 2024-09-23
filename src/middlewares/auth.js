const userAuth = (req, res, next) => {
  const token = "xyza";
  const isAuthenticated = token === "xyz";
  if (isAuthenticated) {
    next();
  } else {
    res.status(401).send("Unauthorised access");
  }
};

module.exports = { userAuth };
