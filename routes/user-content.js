module.exports = (app) => {
  var router = require("express").Router();
  const user = require("../controllers/user-content");

  router.post("/", user.createUserContent);
  router.post("/reply", user.replyUserPost);
  router.post("/like-post", user.sendLikePost);
  router.post("/save-bookmark", user.saveBookmark);
  router.get("/", user.getAllUserPosts);
  router.get("/comments", user.getPostComments);
  router.get("/subscribed-content", user.fetchAllPostsFromFollowedAccounts);
  app.use("/api/user-posts", router);
};
