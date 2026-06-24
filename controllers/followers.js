const User = require("../models/user");
const Follow = require("../models/follow");
const Business = require("../models/business");

exports.followAnotherUser = async (req, res) => {
  if (
    !req.body.secondParty ||
    !req.body.clientUID ||
    !req.body.userEmail ||
    !req.body.secondPartyEmail
  ) {
    return res.status(400).json({
      message: "Request parameters cannot be empty.",
    });
  }

  const { secondParty, clientUID, userEmail, secondPartyEmail } = req.body;

  try {
    const [currentUser, secondPartyUser] = await Promise.all([
      User.findOne({ clientUID }),
      User.findOne({ clientUID: secondParty }),
    ]);

    if (!currentUser || !secondPartyUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Follow.create({
      follower: userEmail,
      followerName: currentUser.userName,
      following: secondPartyEmail,
      followingName: secondPartyUser.userName,
    });

    res.status(200).json({ message: "Followed user successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.blockAnotherUser = async (req, res) => {
  if (!req.body.userEmail || !req.body.secondParty) {
    return res.status(400).json({
      message: "Bad Request. Query requires current user and second party.",
    });
  }

  const { userEmail, secondParty } = req.body;

  try {
    await Follow.deleteMany({
      $or: [
        { follower: userEmail, following: secondParty },
        { follower: secondParty, following: userEmail },
      ],
    });

    res.status(200).json({ message: "Successfully blocked user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.unfollowOneUser = async (req, res) => {
  if (!req.body.secondParty || !req.body.userEmail) {
    return res.status(400).json({
      message: "Request parameters cannot be empty.",
    });
  }

  const { secondParty, userEmail } = req.body;

  try {
    await Follow.findOneAndDelete({
      follower: userEmail,
      following: secondParty,
    });

    res.status(200).json({ message: "Unfollowed user successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateFollowingList = async (req, res) => {
  try {
    if (!req.body || !req.body.clientUID) {
      return res.status(400).json({
        message: "Request body is missing or does not contain parameters.",
      });
    }

    const { clientUID } = req.body;
    const currentUser = await User.findOne({ clientUID });
    const followedUser = await User.findOne({ clientUID });

    if (!followedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await Follow.findOneAndUpdate(
      { follower: currentUser.userEmail, following: followedUser.userEmail },
      {
        follower: currentUser.userEmail,
        followerName: currentUser.userName,
        following: followedUser.userEmail,
        followingName: followedUser.userName,
      },
      { upsert: true, new: true }
    );

    res
      .status(200)
      .json({ message: "Following list successfully updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

exports.followerList = async (req, res) => {
  const client = req.query.clientUID;
  if (!client) {
    return res.status(400).json({ message: "Client UID is required" });
  }

  try {
    const user = await User.findOne({ clientUID: client });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await Follow.find({ following: user.userEmail }).lean();
    res.json(followers);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

exports.followingList = async (req, res) => {
  const client = req.query.clientUID;
  if (!client) {
    return res.status(400).json({ message: "Client UID is required" });
  }

  try {
    const user = await User.findOne({ clientUID: client });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = await Follow.find({ follower: user.userEmail }).lean();
    res.json(following);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

exports.getSuggestedFollows = async (req, res) => {
  try {
    if (!req.query.clientUID) {
      return res
        .status(400)
        .json({ message: "Request parameters cannot be empty" });
    }

    const { clientUID } = req.query;
    const currentUser = await User.findOne({ clientUID });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await Follow.find({
      $or: [
        { follower: currentUser.userEmail },
        { following: currentUser.userEmail },
      ],
    }).lean();

    const connectedEmails = new Set();
    connectedEmails.add(currentUser.userEmail);
    for (const conn of connections) {
      connectedEmails.add(conn.follower);
      connectedEmails.add(conn.following);
    }

    const suggestedBusinesses = await Business.find({
      ownerEmail: { $nin: Array.from(connectedEmails) },
    })
      .select("businessName category ownerClientUID ownerEmail")
      .limit(10)
      .lean();

    res.json(suggestedBusinesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", cause: err });
  }
};
