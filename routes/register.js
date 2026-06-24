module.exports = (app) => {
  var router = require("express").Router();
  const registration = require("../controllers/register");
  const { cacheMiddleware } = require("../middleware/cache");

  router.post("/", registration.createBusiness);
  router.post("/edit", registration.update);
  router.get("/", cacheMiddleware("businesses", 300), registration.findAll);
  router.get("/business-entity", registration.findOne);
  router.get("/categories", cacheMiddleware("categories", 600), registration.getAllBusinessCategories);
  router.get("/cities", cacheMiddleware("cities", 600), registration.getAllCities);
  router.get("/regions", cacheMiddleware("regions", 600), registration.getAllStates);
  router.get("/grouped", cacheMiddleware("grouped", 300), registration.getBusinessByLocation);
  app.use("/api/register", router);
};
