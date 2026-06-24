const User = require("../models/user");
const Follow = require("../models/follow");
const Business = require("../models/business");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.followAnotherUser = async (req, res) => {
  if (
    !req.body.secondParty ||
    !req.body.clientUID ||
    !req.body.userEmail ||
    !req.body.secondPartyEmail
  ) {
    return badRequest(res, "Request parameters cannot be empty.");
  }

  const { secondParty, clientUID, userEmail, secondPartyEmail } = req.body;

  try {
    const [currentUser, secondPartyUser] = await Promise.all([
      User.findOne({ clientUID }),
      User.findOne({ clientUID: secondParty }),
    ]);

    if (!currentUser || !secondPartyUser) {
      return notFound(res, "User not found");
    }

    await Follow.create({
      follower: userEmail,
      followerName: currentUser.userName,
      following: secondPartyEmail,
      followingName: secondPartyUser.userName,
    });

    return success(res, null, "Followed user successfully");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.blockAnotherUser = async (req, res) => {
  if (!req.body.userEmail || !req.body.secondParty) {
    return badRequest(res, "Bad Request. Query requires current user and second party.");
  }

  const { userEmail, secondParty } = req.body;

  try {
    await Follow.deleteMany({
      $or: [
        { follower: userEmail, following: secondParty },
        { follower: secondParty, following: userEmail },
      ],
    });

    return success(res, null, "Successfully blocked user");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.unfollowOneUser = async (req, res) => {
  if (!req.body.secondParty || !req.body.userEmail) {
    return badRequest(res, "Request parameters cannot be empty.");
  }

  const { secondParty, userEmail } = req.body;

  try {
    await Follow.findOneAndDelete({
      follower: userEmail,
      following: secondParty,
    });

    return success(res, null, "Unfollowed user successfully");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.updateFollowingList = async (req, res) => {
  try {
    if (!req.body || !req.body.clientUID) {
      return badRequest(res, "Request body is missing or does not contain parameters.");
    }

    const { clientUID } = req.body;
    const currentUser = await User.findOne({ clientUID });
    const followedUser = await User.findOne({ clientUID });

    if (!followedUser) {
      return notFound(res, "User not found.");
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

    return success(res, null, "Following list successfully updated.");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.followerList = async (req, res) => {
  const client = req.query.clientUID;
  if (!client) {
    return badRequest(res, "Client UID is required");
  }

  try {
    const user = await User.findOne({ clientUID: client });
    if (!user) {
      return notFound(res, "User not found");
    }

    const followers = await Follow.find({ following: user.userEmail }).lean();
    return success(res, followers);
  } catch (err) {
    return error(res, err.message ?? "Internal Server Error");
  }
};

exports.followingList = async (req, res) => {
  const client = req.query.clientUID;
  if (!client) {
    return badRequest(res, "Client UID is required");
  }

  try {
    const user = await User.findOne({ clientUID: client });
    if (!user) {
      return notFound(res, "User not found");
    }

    const following = await Follow.find({ follower: user.userEmail }).lean();
    return success(res, following);
  } catch (err) {
    return error(res, err.message ?? "Internal Server Error");
  }
};

exports.getSuggestedFollows = async (req, res) => {
  try {
    if (!req.query.clientUID) {
      return badRequest(res, "Request parameters cannot be empty");
    }

    const { clientUID } = req.query;
    const currentUser = await User.findOne({ clientUID });

    if (!currentUser) {
      return notFound(res, "User not found");
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

    return success(res, suggestedBusinesses);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
