const multer = require("multer");

const { uploadOneFile } = require("../controllers/media-upload");

module.exports = (app) => {
  var express = require("express");
  router = express.Router();

  const upload = multer({ storage: multer.memoryStorage() });

  router.post("/", upload.single("image"), uploadOneFile);

  //set this router
  app.use("/api/upload-image", router);
};
