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
        city: String,
        state: String,
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
        ratedBy: String,
        ratingsDate: String,
      },
    ],
    followers: [
      {
        followerName: String,
        followDate: Number,
        hasBlocked: Boolean,
        hasUnfollowed: Boolean,
        hasFollowed: Boolean,
        hasReported: Boolean,
      },
    ],
    following: [
      {
        followerName: String,
        followDate: Number,
      },
    ],
    userContent: [
      {
        contentId: String,
        contentBody: String,
        contentImage: String,
        likes: [
          {
            likeId: String,
            isUnliked: Boolean,
            likedUserName: String,
            likerUserId: String,
            isBookmarked: Boolean,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserAccount);
