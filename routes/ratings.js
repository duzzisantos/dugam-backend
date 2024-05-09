module.exports = (app) => {
  const {
    createRating,
    getAllRatings,
    deleteOneRating,
    updateOneRating,
    getReceivedRatings,
  } = require("../controllers/ratings");
  var router = require("express").Router();

  router.post("/", createRating);
  router.put("/:id", updateOneRating);
  router.get("/", getAllRatings);
  router.get("/received", getReceivedRatings);
  router.delete("/:id", deleteOneRating);
  app.use("/api/ratings", router);
};
