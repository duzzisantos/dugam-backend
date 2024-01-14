module.exports = (app) => {
  const messages = require("../controllers/messages");
  var router = require("express").Router();

  router.post("/", messages.createMessage);
  router.post("/reply", messages.replyMessages);
  router.get("/", messages.getMessages);
  app.use("/api/direct-messages", router);
};
