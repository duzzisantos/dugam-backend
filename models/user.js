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
        ratingsTitle: String,
        ratingsContent: String,
        ratedBy: String,
        ratingStars: Number,
        ratingsDate: String,
        ratingsOwner: String,
      },
    ],
    followers: [
      {
        follower: String,
        followerName: String,
        isFollower: Boolean,
      },
    ],
    following: [
      {
        follower: String,
        followerName: String,
        isFollowing: Boolean,
        reportHistory: [{ report: String, recommendation: String }],
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
          },
        ],
      },
    ],
    directMessages: [
      {
        sender: String,
        subject: String,
        sendDate: String,
        messageBody: String,
        replies: [
          {
            repliedBy: String,
            replyDate: String,
            replyBody: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserAccount);
