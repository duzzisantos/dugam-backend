exports.useAuthorization = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const decodedToken = jwtDecode(token);

  if (decodedToken.aud === process.env.AUTHORIZATION_AUD) {
    req.decodedToken = decodedToken;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized Access" });
  }
};
