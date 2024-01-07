module.exports = (app) => {
  var router = require("express").Router();
  const registration = require("../controllers/register");

  router.post("/", registration.createBusiness);
  router.get("/", registration.findAll);
  router.get("/business-entity", registration.findOne);
  app.use("/api/register", router);
};
