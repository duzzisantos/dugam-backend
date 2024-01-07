module.exports = (app) => {
  var router = require("express").Router();
  const user = require("../controllers/user-content");

  router.post("/", user.createUserContent);
  router.get("/", user.getAllUserPosts);
  router.get("/subscribed-content", user.fetchAllPostsFromFollowedAccounts);
  app.use("/api/user-posts", router);
};
