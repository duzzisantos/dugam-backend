const User = require("../models/user");

exports.followAnotherUser = async (req, res) => {
  if (!req.body) {
    res.status(400).json({
      message:
        "Request body cannot be empty. Following request needs a request header",
    });
    return;
  }

  if (req.body.userEmail) {
    const { followerId, followerName, isBlocked, isUnfollowed } = req.body;

    const emailAddress = req.body.userEmail;

    try {
      const userToBeFollowed = await User.findOne({ userEmail: emailAddress });
      if (userToBeFollowed) {
        await User.updateOne(
          { userEmail: emailAddress },
          {
            $push: {
              followers: {
                followerId,
                followerName,
                isBlocked,
                isUnfollowed,
              },
            },
          }
        );

        res
          .status(200)
          .json({ message: "Successfully registered new business" });
      } else {
        res
          .status(404)
          .json({ message: "User was not found. Please try again." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Certain fields on the form are missing" });
  }
};

exports.followerList = async (req, res) => {
  const id = req.query.id;
  var condition = id ? { $regex: new RegExp(id), $options: "i" } : {};

  await User.find(condition)
    .then((data) => {
      const followers = data.map((element) => element.followers);
      res.json(followers);
    })
    .catch((err) =>
      res.status(500).json({ message: err.message ?? "Internal Server Error" })
    );
};
