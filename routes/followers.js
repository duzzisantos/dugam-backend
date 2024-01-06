module.exports = (app) => {
  var router = require("express").Router();
  const follower = require("../controllers/followers");
  router.post("/", follower.followAnotherUser);
  router.get("/", follower.followerList);
  app.use("/api/followers", router);
};
