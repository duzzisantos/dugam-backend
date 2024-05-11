const UserAccount = require("../models/user");

/**
 *
 * @param {object} req
 * @param {object} res
 * @returns returns an array of objects of customer ratings for a specific customer
 */
exports.createRating = async (req, res) => {
  if (req.body === "" || !req.body) {
    res.status(400).json({ message: "Request body for ratings is empty!" });
    return;
  }

  if (req.body.ratingsOwner) {
    const {
      ratingsContent,
      ratedBy,
      ratingsDate,
      ratingStars,
      ratingsTitle,
      ratingsOwner,
    } = req.body;

    const personToRate = req.body.ratingsOwner;

    try {
      const rated = await UserAccount.findOne({
        userEmail: personToRate,
      });
      if (rated && typeof rated === "object") {
        await UserAccount.updateOne(
          { userEmail: personToRate },
          {
            $push: {
              ratings: {
                ratingsTitle,
                ratingsContent,
                ratedBy,
                ratingsDate,
                ratingStars,
                ratingsOwner,
              },
            },
          }
        );
        res.status(200).json({ message: "Ratings successfully added" });
      } else {
        res
          .status(404)
          .json({ message: "User not found. Ratings cannot be added." });
      }
    } catch (err) {
      console.warn(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res
      .status(400)
      .json({ message: "Request body is missing the required field" });
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * returns an array of objects of all ratings made by current user
 */
exports.getAllRatings = async (req, res) => {
  const id = req.query.id;
  var condition = id ? { $regex: new RegExp(id), $options: "i" } : {};
  await UserAccount.find(condition)
    .then((data) => {
      if (!data) {
        res.json(404).json({ message: "Not found" });
      } else {
        const found = data.map((el) => el.ratings);
        res.json(found);
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving all vendors" });
    });
};

//Ratings made about current user's business
exports.getReceivedRatings = async (req, res) => {
  const client = req.query.userEmail;

  if (client) {
    await UserAccount.find()
      .then((item) => {
        const result = [];
        item.forEach((vendor) => {
          const ratings = vendor.ratings;

          return ratings.forEach((rating) => {
            client === rating.ratingsOwner
              ? result.push({
                  ratingsOwner: rating.ratingsOwner,
                  ratingsDate: rating.ratingsDate,
                  ratingStars: rating.ratingStars,
                  ratedBy: rating.ratedBy,
                  ratingsContent: rating.ratingsContent,
                  ratingsTitle: rating.ratingsTitle,
                })
              : [];
          });
        });
        res.json(result.flat());
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * returns a modified customer ratings based on its object id and only ratings content pertaining to email-identified customer
 */
exports.updateOneRating = async (req, res) => {
  const client = req.body.clientUID;
  const { ratingsContent, ratingsDate, ratedBy, ratingStars, ratingsTitle } =
    req.body;

  try {
    const foundUser = await UserAccount.findOne({ clientUID: client });
    const id = req.params.id;
    if (foundUser) {
      await UserAccount.findByIdAndUpdate(
        id,
        {
          $set: {
            ratings: {
              ratingsContent,
              ratingsDate,
              ratedBy,
              ratingStars,
              ratingsTitle,
            },
          },
        },
        (err, data, next) => {
          if (err) {
            return next(err);
          } else {
            res.status(200).json({ message: "Successfully updated ratings" });
            res.json(data);
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteOneRating = async (req, res) => {
  const client = req.body.clientUID;

  try {
    const foundUser = await UserAccount.findOne({ clientUID: client });
    if (foundUser) {
      const id = foundUser.ratings.id.toString();
      await UserAccount.findByIdAndDelete(id);

      res.status(200).json({
        message:
          "Successfully deleted one rating wit ID: " + id ?? "Not Available",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(404)
      .json({ message: "Resource not found. No ratings to delete." });
  }
};
