module.exports = (app) => {
  var router = require("express").Router();
  const file = require("../controllers/report-logs");

  router.post("/", file.createReport);
  app.use("/api/report-logs", router);
};
