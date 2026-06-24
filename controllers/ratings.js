const User = require("../models/user");
const Rating = require("../models/rating");

exports.createRating = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ message: "Request body for ratings is empty!" });
  }

  if (!req.body.ratingsOwner) {
    return res
      .status(400)
      .json({ message: "Request body is missing the required field" });
  }

  const {
    ratingsContent,
    ratedBy,
    ratingsDate,
    ratingStars,
    ratingsTitle,
    ratingsOwner,
  } = req.body;

  try {
    const userExists = await User.findOne({ userEmail: ratingsOwner });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "User not found. Ratings cannot be added." });
    }

    await Rating.create({
      ratingsOwner,
      ratedBy,
      ratingsTitle,
      ratingsContent,
      ratingStars,
      ratingsDate,
    });

    res.status(200).json({ message: "Ratings successfully added" });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().lean();
    res.json(ratings);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving all vendors" });
  }
};

exports.getReceivedRatings = async (req, res) => {
  const client = req.query.userEmail;

  if (!client) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    const ratings = await Rating.find({ ratingsOwner: client }).lean();
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateOneRating = async (req, res) => {
  const id = req.params.id;
  const { ratingsContent, ratingsDate, ratedBy, ratingStars, ratingsTitle } =
    req.body;

  try {
    const rating = await Rating.findByIdAndUpdate(
      id,
      { $set: { ratingsContent, ratingsDate, ratedBy, ratingStars, ratingsTitle } },
      { new: true }
    );

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json({ message: "Successfully updated ratings" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteOneRating = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await Rating.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Resource not found. No ratings to delete." });
    }

    res.status(200).json({ message: "Successfully deleted rating" });
  } catch (err) {
    console.error(err);
    res
      .status(404)
      .json({ message: "Resource not found. No ratings to delete." });
  }
};
