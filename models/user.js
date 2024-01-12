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
        ratingsContent: String,
        ratedBy: String,
        ratingStars: Number,
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
        authorEmail: String,
        authorName: String,
        contentBody: String,
        contentImage: String,
        likes: [
          {
            likedUserName: String,
            dateLiked: String,
          },
        ],
        isBookmarked: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserAccount);
