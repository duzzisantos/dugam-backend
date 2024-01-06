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
    const {
      followerName,
      hasReported,
      hasUnfollowed,
      hasFollowed,
      hasBlocked,
    } = req.body;

    const emailAddress = req.body.userEmail;

    try {
      const userToBeFollowed = await User.findOne({ userEmail: emailAddress });
      if (userToBeFollowed) {
        //Update user's followers list
        await User.updateOne(
          { userEmail: emailAddress },
          {
            $push: {
              followers: {
                followerName,
                hasReported,
                hasUnfollowed,
                hasFollowed,
                hasBlocked,
              },
            },
          }
        );

        res.status(200).json({ message: "Successfully followed another user" });
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

//Iterates through the list find how many users in whose followers list another user's information exists. If found,
//the following list is populated with their follower information
exports.updateFollowingList = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing or does not contain userEmail.",
      });
    }

    if (req.body.userEmail) {
      const followedUser = req.body.userEmail;
      const { followerName } = req.body;
      // Find the current user and user who is currently followed
      const followed = await User.findOne({ userEmail: followedUser });
      const currentUser = await User.findOne({ userEmail: followerName });

      if (!followed) {
        return res.status(404).json({ message: "User not found." });
      }

      // Update the current user's following array
      currentUser.following.push({
        followerName: followed.userEmail,
        followDate: followed.followDate,
      });

      // Save the updated user
      await currentUser.save();

      return res
        .status(200)
        .json({ message: "Following list successfully updated." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
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
