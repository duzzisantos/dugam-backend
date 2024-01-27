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

exports.blockAnotherUser = async (req, res) => {
  try {
    if (!req.body) {
      atus(400).json({ message: "Bad Request. Body cannot be empty" });
    }

    const blockee = req.query.blockee;
    const blocker = req.query.blocker;

    if (blockee) {
      //find bother the blocking user and user being blocked to make sure that they unfollow each other
      const userToBeBlocked = await User.findOne({ userEmail: blockee });
      const userInitiatingBlock = await User.findOne({ userEmail: blocker });

      const modifyBlockeeFollowers = userToBeBlocked.followers.find((person) =>
        person.followerName.includes(blocker)
      );

      const modifyBlockerFollowers = userInitiatingBlock.followers.find(
        (person) => person.followerName.includes(blockee)
      );

      //Makes sure that as current user blocks another user, both of their follower records are deleted
      if (modifyBlockeeFollowers && modifyBlockerFollowers) {
        //On the blockee's side
        userToBeBlocked.followers.splice(
          userToBeBlocked.followers.indexOf(modifyBlockeeFollowers),
          1
        );

        userToBeBlocked.following.splice(
          userToBeBlocked.following.indexOf(modifyBlockeeFollowers),
          1
        );

        //On the blcoker's side
        userInitiatingBlock.followers.splice(
          userInitiatingBlock.followers.indexOf(modifyBlockerFollowers),
          1
        );

        userInitiatingBlock.following.splice(
          userInitiatingBlock.following.indexOf(modifyBlockerFollowers),
          1
        );

        await userToBeBlocked.save();
        await userInitiatingBlock.save();

        res.status(200).json({ message: "User successfully blocked" });
      } else {
        res.status(404).JSON({ message: "The users to block were not found" });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
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
