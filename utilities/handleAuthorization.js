const { jwtDecode } = require("jwt-decode");
const { unauthorized } = require("./response");

exports.handleAuthorization = (app) => {
  app.use((req, res, next) => {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return unauthorized(res);
    }

    const decodedToken = jwtDecode(token);

    if (decodedToken.aud === process.env.AUTHORIZATION_AUD) {
      req.decodedToken = decodedToken;
      next();
    } else {
      return unauthorized(res);
    }
  });
};
