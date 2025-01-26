exports.useRoutes = (app) => {
  //REST API routes
  require("../routes/register")(app);
  require("../routes/signup")(app);
  require("../routes/followers")(app);
  require("../routes/user-content")(app);
  require("../routes/ratings")(app);
  require("../routes/messages")(app);
  require("../routes/business-query")(app);
  require("../routes/report-logs")(app);
  require("../routes/media-upload.js")(app);
};
