const User = require("../models/user");
const Rating = require("../models/rating");
const { invalidateCache } = require("../middleware/cache");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.createRating = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "Request body for ratings is empty!");
  }

  if (!req.body.ratingsOwner) {
    return badRequest(res, "Request body is missing the required field");
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
      return notFound(res, "User not found. Ratings cannot be added.");
    }

    const rating = await Rating.create({
      ratingsOwner,
      ratedBy,
      ratingsTitle,
      ratingsContent,
      ratingStars,
      ratingsDate,
    });

    invalidateCache("ratings");
    invalidateCache("received-ratings");

    return success(res, rating, "Ratings successfully added");
  } catch (err) {
    console.warn(err);
    return error(res);
  }
};

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().lean();
    return success(res, ratings);
  } catch (err) {
    return error(res, err.message || "Error in retrieving ratings");
  }
};

exports.getReceivedRatings = async (req, res) => {
  const client = req.query.userEmail;

  if (!client) {
    return badRequest(res, "User email is required");
  }

  try {
    const ratings = await Rating.find({ ratingsOwner: client }).lean();
    return success(res, ratings);
  } catch (err) {
    console.error(err);
    return error(res);
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
      return notFound(res, "Rating not found");
    }

    invalidateCache("ratings");
    invalidateCache("received-ratings");

    return success(res, rating, "Successfully updated ratings");
  } catch (err) {
    console.log(err);
    return error(res);
  }
};

exports.deleteOneRating = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await Rating.findByIdAndDelete(id);
    if (!deleted) {
      return notFound(res, "Resource not found. No ratings to delete.");
    }

    invalidateCache("ratings");
    invalidateCache("received-ratings");

    return success(res, null, "Successfully deleted rating");
  } catch (err) {
    console.error(err);
    return notFound(res, "Resource not found. No ratings to delete.");
  }
};
