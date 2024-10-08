module.exports = (app) => {
  var router = require("express").Router();
  const user = require("../controllers/signup");

  router.post("/", user.create);
  router.post("/add-client", user.updateUsers);
  router.get("/", user.findOne);
  app.use("/api/signup", router);
};
