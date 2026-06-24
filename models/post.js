const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    authorEmail: {
      type: String,
      required: true,
      index: true,
    },
    authorClientUID: String,
    authorName: String,
    contentBody: String,
    contentImage: String,
    authorImage: String,
    category: String,
    isEdited: { type: Boolean, default: false },
    isBookmarked: { type: Boolean, default: false },
    likes: [
      {
        likedUserName: String,
        likedUID: String,
        isUnliked: Boolean,
        isLiked: Boolean,
        dateLiked: String,
      },
    ],
    comments: [
      {
        commentBody: String,
        commentDate: String,
        commentBy: String,
        isEdited: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", PostSchema);
