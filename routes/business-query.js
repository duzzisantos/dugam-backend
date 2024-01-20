module.exports = (app) => {
  var router = require("express").Router();
  const business = require("../controllers/business-query");

  router.get("/general-search", business.getBusinessByAnyParameter);
  router.get("/narrow-search", business.getBusinessByLimitedSearch);
  app.use("/api/query-business", router);
};
