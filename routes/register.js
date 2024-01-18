module.exports = (app) => {
  var router = require("express").Router();
  const registration = require("../controllers/register");

  router.post("/", registration.createBusiness);
  router.get("/", registration.findAll);
  router.get("/business-entity", registration.findOne);
  router.get("/categories", registration.getAllBusinessCategories);
  router.get("/cities", registration.getAllCities);
  router.get("/regions", registration.getAllStates);
  app.use("/api/register", router);
};
