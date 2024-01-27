module.exports = (app) => {
  var router = require("express").Router();
  const follower = require("../controllers/followers");
  router.post("/", follower.followAnotherUser);
  router.post("/update-following", follower.updateFollowingList);
  router.post("/block", follower.blockAnotherUser);
  router.get("/get-followers", follower.followerList);
  router.get("/get-following", follower.followingList);
  app.use("/api/followers", router);
};
