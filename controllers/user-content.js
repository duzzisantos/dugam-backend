const User = require("../models/user");
const Post = require("../models/post");
const Follow = require("../models/follow");
const Business = require("../models/business");

exports.createUserContent = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Request body cannot be empty. Content posting cannot be empty",
    });
  }

  if (!req.body.userEmail) {
    return res
      .status(400)
      .json({ message: "Certain fields on the form are missing" });
  }

  const { contentBody, contentImage, authorEmail, authorName } = req.body;
  const client = req.body.userEmail;

  try {
    const selectedUser = await User.findOne({ userEmail: client });
    if (!selectedUser) {
      return res
        .status(404)
        .json({ message: "User was not found. Please try again." });
    }

    const business = await Business.findOne({
      ownerEmail: client,
    }).lean();

    await Post.create({
      authorEmail,
      authorName,
      authorClientUID: selectedUser.clientUID,
      contentBody,
      contentImage,
      category: business?.category || null,
      authorImage: null,
      likes: [],
      comments: [],
    });

    res.status(200).json({ message: "Successfully added a new post" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllUserPosts = async (req, res) => {
  const currentUser = req?.query?.userEmail;
  if (!currentUser) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    const posts = await Post.find({ authorEmail: currentUser }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.fetchAllPostsFromFollowedAccounts = async (req, res) => {
  try {
    const currentUser = req?.query?.userEmail;
    if (!currentUser) {
      return res.status(400).json({ message: "User email is required" });
    }

    const connections = await Follow.find({
      $or: [{ follower: currentUser }, { following: currentUser }],
    }).lean();

    const connectedEmails = new Set();
    for (const conn of connections) {
      if (conn.follower !== currentUser) connectedEmails.add(conn.follower);
      if (conn.following !== currentUser) connectedEmails.add(conn.following);
    }

    const posts = await Post.find({
      authorEmail: { $in: Array.from(connectedEmails) },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.replyUserPost = async (req, res) => {
  const postId = req.query.id;
  const { commentDate, commentBody, commentBy } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: { commentBody, commentBy, commentDate },
        },
      },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }

    res.status(200).json({ message: "User post successfully replied." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostComments = async (req, res) => {
  const postId = req.query.id;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findById(postId).lean();
    if (!post) {
      return res
        .status(404)
        .json({ message: "Either Content or comments do not exist" });
    }

    res.json(post.comments);
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.sendLikePost = async (req, res) => {
  const postId = req.query.id;
  const { likedUserName, dateLiked } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: {
            likedUserName,
            dateLiked,
            isUnliked: false,
            isLiked: true,
          },
        },
      },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }

    res.status(200).json({ message: "User post successfully liked." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.unlikePost = async (req, res) => {
  const postId = req.query.id;
  const { likedUserName, dateLiked } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findOneAndUpdate(
      { _id: postId, "likes.likedUserName": likedUserName },
      {
        $set: {
          "likes.$.isUnliked": true,
          "likes.$.isLiked": false,
          "likes.$.dateLiked": dateLiked,
        },
      },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }

    res.status(200).json({ message: "User post successfully unliked." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveBookmark = async (req, res) => {
  const postId = req.query.id;
  const { isBookmarked } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $set: { isBookmarked } },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }

    res.status(200).json({ message: "User post successfully bookmarked." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.suggestedFollowers = async (req, res) => {
  try {
    const client = req.query.clientUID;
    if (!client) {
      return res.status(400).json({ message: "Client UID is required" });
    }

    const currentUser = await User.findOne({ clientUID: client });
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

    const suggestions = await Business.find({
      ownerEmail: { $nin: Array.from(connectedEmails) },
    })
      .limit(5)
      .lean();

    res.json(suggestions);
  } catch (err) {
    res.status(404).json({
      message: err.message || "User not found or no relationship with user",
    });
  }
};

exports.deleteOnePost = async (req, res) => {
  const id = req.query.id;
  const client = req.query.userEmail;

  if (!id || !client) {
    return res
      .status(400)
      .json({ message: "Post ID and user email are required" });
  }

  try {
    const deleted = await Post.findOneAndDelete({
      _id: id,
      authorEmail: client,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Successfully deleted post." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.editPost = async (req, res) => {
  if (!req.query || !req.body) {
    return res.status(400).json({
      message: "Either Post ID, user, or request body is empty.",
    });
  }

  const { id } = req.query;
  const { isEdited, contentBody, contentImage } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $set: { contentBody, contentImage, isEdited },
      },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ message: "Either user or Post ID was not found." });
    }

    res.status(200).json({ message: "Post successfully edited." });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
