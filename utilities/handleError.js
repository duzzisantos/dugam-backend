const { error } = require("./response");

exports.handleError = (app) => {
  app.use("/", (err, req, res, next) => {
    console.error(err.stack);
    return error(res, "Backend Error!");
  });
};
