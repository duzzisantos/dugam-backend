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

  if (req.body.userEmail) {
    const { ratingsContent, ratedBy, ratingsDate, ratingStar } = req.body;

    const emailAddress = req.body.userEmail;

    try {
      const ratingsOwner = await UserAccount.findOne({
        userEmail: emailAddress,
      });
      if (ratingsOwner && typeof ratingsOwner === "object") {
        await UserAccount.updateOne(
          { userEmail: emailAddress },
          {
            $push: {
              ratings: {
                ratingsContent,
                ratedBy,
                ratingsDate,
                ratingStar,
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
 * returns an array of objects of all ratings pertaining to the customer whose email address is determined
 */
exports.getAllRatings = (req, res) => {
  const id = req.query.id;
  var regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

  const emailAddress = req.body.emailAddress;
  UserAccount.find(regex)
    .then((data) => {
      const foundData = data
        .filter((item) => (item.userEmail === emailAddress ? item : !item))
        .map((element) => element.ratings);

      res.json(foundData);
    })
    .catch((err) => {
      console.warn(err);
      res.status(404).json({ message: "Ratings data not found" });
    });
};

/**
 *
 * @param {object} req
 * @param {object} res
 * returns a modified customer ratings based on its object id and only ratings content pertaining to email-identified customer
 */
exports.updateOneRating = async (req, res) => {
  const emailAddress = req.body.emailAddress;
  const { ratingsContent, ratingsDate, ratingsOwner, ratingStar } = req.body;

  try {
    const foundUser = await UserAccount.findOne({ userEmail: emailAddress });
    const id = req.params.id;
    if (foundUser) {
      await UserAccount.findByIdAndUpdate(
        id,
        {
          $set: {
            ratings: {
              ratingsContent,
              ratingsDate,
              ratingsOwner,
              ratingStar,
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
  const emailAddress = req.body.userEmail;

  try {
    const foundUser = await UserAccount.findOne({ userEmail: emailAddress });
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
