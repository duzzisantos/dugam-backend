module.exports = (app) => {
  var router = require("express").Router();
  const business = require("../controllers/business-query");
  const { cacheMiddleware } = require("../middleware/cache");

  router.get("/general-search", cacheMiddleware("search", 120), business.getBusinessByAnyParameter);
  router.get("/narrow-search", cacheMiddleware("narrow-search", 120), business.getBusinessByLimitedSearch);
  app.use("/api/query-business", router);
};
