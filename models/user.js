const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAccount = new Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    userEmail: {
      type: String,
      unique: true,
    },
    userName: String,
    registeredBusinesses: [
      {
        businessID: String,
        firstName: String,
        lastName: String,
        businessName: String,
        address: String,
        email: String,
        businessPhone: String,
        category: String,
        photos: [{ imageId: String, image: String }],
      },
    ],
    ratings: [
      {
        ratingsId: String,
        ratingsContent: String,
        receivedBy: String,
        ratingsDate: String,
      },
    ],
    followers: [
      {
        followerId: String,
        followerName: String,
        isBlocked: Boolean,
        isUnfollowed: Boolean,
      },
    ],
    following: [
      {
        followerId: String,
        followerName: String,
        isBlocked: Boolean,
        isUnfollowed: Boolean,
      },
    ],
    userContent: [
      {
        contentId: String,
        contentBody: String,
        contentImage: String,
        likes: [{ likeId: String, isUnliked: Boolean }],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserAccount);
