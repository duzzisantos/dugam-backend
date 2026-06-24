const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingSchema = new Schema(
  {
    ratingsOwner: {
      type: String,
      required: true,
      index: true,
    },
    ratedBy: {
      type: String,
      required: true,
    },
    ratingsTitle: String,
    ratingsContent: String,
    ratingStars: Number,
    ratingsDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("rating", RatingSchema);
