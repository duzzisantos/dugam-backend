module.exports = (app) => {
  var router = require("express").Router();
  const user = require("../controllers/signup");

  router.post("/", user.create);
  router.get("/:userEmail", user.findOne);
  app.use("/api/signup", router);
};
