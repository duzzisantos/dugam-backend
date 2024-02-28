module.exports = (app) => {
  var router = require("express").Router();
  const follower = require("../controllers/followers");
  router.post("/follow-user", follower.followAnotherUser);
  router.post("/update-following", follower.updateFollowingList);
  router.post("/unfollow-user", follower.unfollowOneUser);
  router.post("/block", follower.blockAnotherUser);
  router.get("/get-followers", follower.followerList);
  router.get("/get-following", follower.followingList);
  app.use("/api/followers", router);
};
