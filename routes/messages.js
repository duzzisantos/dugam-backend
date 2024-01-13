module.exports = (app) => {
  const messages = require("../controllers/messages");
  var router = require("express").Router();

  router.post("/", messages.createMessage);
  app.use("/api/direct-messages", router);
};
