module.exports = (app) => {
  const {
    createRating,
    getAllRatings,
    deleteOneRating,
    updateOneRating,
    getReceivedRatings,
  } = require("../controllers/ratings");
  const { cacheMiddleware } = require("../middleware/cache");
  var router = require("express").Router();

  router.post("/", createRating);
  router.put("/:id", updateOneRating);
  router.get("/", cacheMiddleware("ratings", 180), getAllRatings);
  router.get("/received", cacheMiddleware("received-ratings", 180), getReceivedRatings);
  router.delete("/:id", deleteOneRating);
  app.use("/api/ratings", router);
};
