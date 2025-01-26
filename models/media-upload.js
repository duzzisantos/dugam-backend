const mongoose = require("mongoose");

const MediaUploadSchema = mongoose.Schema(
  {
    clientID: String,
    image: [
      {
        imageURL: String,
        metaData: {
          contentType: String,
          customMetaData: {
            uploadedBy: String,
            fileSize: String,
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

MediaUploadSchema.index({ clientID: 1 });

module.exports = mongoose.model("media-upload", MediaUploadSchema);
