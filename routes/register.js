module.exports = (app) => {
  var router = require("express").Router();
  const registration = require("../controllers/register");

  router.post("/", registration.createBusiness);
  router.post("/edit", registration.update);
  router.get("/", registration.findAll);
  router.get("/business-entity", registration.findOne);
  router.get("/categories", registration.getAllBusinessCategories);
  router.get("/cities", registration.getAllCities);
  router.get("/regions", registration.getAllStates);
  router.get("/grouped", registration.getBusinessByLocation);
  app.use("/api/register", router);
};
