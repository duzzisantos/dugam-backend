const User = require("../models/user");

//Current user follows another user, then their following list is updated, while the second party's followers list is updated with current user's account details/id
exports.followAnotherUser = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    if (!req.query.secondParty || !req.query.clientUID) {
      return res.status(400).json({
        message: "Request parameters cannot be empty.",
      });
    }

    const { secondParty, clientUID } = req.query;

    const currentName = (await User.find({ clientUID: clientUID }))
      .map((element) => element.userName)
      .join("");

    const secondPartyName = (await User.find({ clientUID: secondParty }))
      .map((element) => element.userName)
      .join("");

    await User.updateOne(
      { clientUID: secondParty },
      {
        $push: {
          followers: {
            follower: clientUID,
            followerName: currentName,
            isFollower: true,
          },
        },
      },
      { session }
    );

    await User.updateOne(
      { clientUID: clientUID },
      {
        $push: {
          following: {
            follower: secondParty,
            followerName: secondPartyName,
            isFollowing: true,
          },
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
    if (!req.query.clientUID || !req.query.secondParty) {
      req.status(400).json({
        message: "Bad Request. Query requires current user and second party.",
      });
    }

    const { clientUID, secondParty } = req.query;

    await User.updateOne(
      { clientUID: clientUID },
      {
        $pull: {
          following: { followerName: secondParty },
        },
      },
      { session }
    );

    await User.updateOne(
      { clientUID: secondParty },
      {
        $pull: {
          followers: { followerName: clientUID },
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
    if (!req.query.secondParty || !req.query.clientUID) {
      return res.status(400).json({
        message:
          "Request cannot be empty. Current User and Second Party missing",
      });
    }

    const { secondParty, clientUID } = req.query;

    await User.updateOne(
      { clientUID: clientUID },
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

    if (req.body.clientUID) {
      const followedUser = req.body.clientUID;
      const { clientUID } = req.body;
      // Find the current user and user who is currently followed
      const followed = await User.findOne({ clientUID: followedUser });
      const currentUser = await User.findOne({ clientUID });

      if (!followed) {
        return res.status(404).json({ message: "User not found." });
      }

      // Update the current user's following array
      currentUser.following.push({
        followerName: followed.clientUID,
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
  const client = req.query.clientUID;
  if (client) {
    await User.find({ clientUID: client })
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
  const client = req.query.clientUID;
  if (client) {
    await User.find({ clientUID: client })
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

exports.getSuggestedFollows = async (req, res) => {
  try {
    if (!req.query.clientUID) {
      res.status(400).json({ message: "Request parameters cannot be empty" });
    }

    const { clientUID } = req.query;
    const clients = await User.find();
    if (clientUID) {
      const suggested = [];
      clients.forEach((client) => {
        const [followers, following, clientBusiness] = [
          client.followers,
          client.following,
          client.registeredBusinesses,
        ];

        const businessWithFewDetails = clientBusiness.map((el) => ({
          //this is the whole point. We do not want to render unnecessary data
          businessName: el.businessName,
          category: el.category,
          clientUID: client.clientUID,
        }));

        if (followers.some((person) => person.follower === clientUID)) {
          return [];
        } else if (following.some((person) => person.follower === clientUID)) {
          return [];
        } else {
          suggested.push(businessWithFewDetails);
        }
      });
      res.json(suggested.flat());
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
