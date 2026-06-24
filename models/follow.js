const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = new Schema(
  {
    follower: {
      type: String,
      required: true,
      index: true,
    },
    followerName: String,
    following: {
      type: String,
      required: true,
      index: true,
    },
    followingName: String,
  },
  { timestamps: true }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model("follow", FollowSchema);
