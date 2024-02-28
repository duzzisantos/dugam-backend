const User = require("../models/user");

//Current user follows another user, then their following list is updated, while the second party's followers list is updated with current user's account details/id
exports.followAnotherUser = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    if (!req.query.secondParty || !req.query.currentUser) {
      return res.status(400).json({
        message:
          "Request cannot be empty. Current User and Second Party missing",
      });
    }

    const { secondParty, currentUser } = req.query;

    await User.updateOne(
      { userEmail: secondParty },
      {
        $push: {
          followers: { followerName: currentUser, isFollower: true },
        },
      },
      { session }
    );

    await User.updateOne(
      { userEmail: currentUser },
      {
        $push: {
          following: { followerName: secondParty, isFollowing: true },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Followed user successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Remove second party from current user's following list and current user from second party's follower's list
//To initiate blocking

exports.blockAnotherUser = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    if (!req.query.currentUser || !req.query.secondParty) {
      req.status(400).json({
        message: "Bad Request. Query requires current user and second party.",
      });
    }

    const { currentUser, secondParty } = req.query;

    await User.updateOne(
      { userEmail: currentUser },
      {
        $pull: {
          following: { followerName: secondParty },
        },
      },
      { session }
    );

    await User.updateOne(
      { userEmail: secondParty },
      {
        $pull: {
          followers: { followerName: currentUser },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Successfully blocked user" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Unfollow one user who  is
exports.unfollowOneUser = async (req, res) => {
  try {
    if (!req.query.secondParty || !req.query.currentUser) {
      return res.status(400).json({
        message:
          "Request cannot be empty. Current User and Second Party missing",
      });
    }

    const { secondParty, currentUser } = req.query;

    await User.updateOne(
      { userEmail: currentUser },
      {
        $pull: {
          following: { followerName: secondParty, isFollowing: false },
        },
      }
    );

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Iterates through the list find how many users in whose followers list another user's information exists. If found,
//the following list is populated with their follower information
exports.updateFollowingList = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing or does not contain parameters.",
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
  const emailAddress = req.query.userEmail;
  if (emailAddress) {
    await User.find({ userEmail: emailAddress })
      .then((data) => {
        const followers = data.map((element) => element.followers);
        res.json(followers);
      })
      .catch((err) =>
        res
          .status(500)
          .json({ message: err.message ?? "Internal Server Error" })
      );
  }
};

exports.followingList = async (req, res) => {
  const emailAddress = req.query.userEmail;
  if (emailAddress) {
    await User.find({ userEmail: emailAddress })
      .then((data) => {
        const following = data.map((element) => element.following);
        res.json(following);
      })
      .catch((err) =>
        res
          .status(500)
          .json({ message: err.message ?? "Internal Server Error" })
      );
  }
};
