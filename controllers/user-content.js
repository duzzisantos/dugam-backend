const User = require("../models/user");

//create specific posts from current user
exports.createUserContent = async (req, res) => {
  if (!req.body) {
    res.status(400).json({
      message: "Request body cannot be empty. Content posting cannot be empty",
    });
    return;
  }

  if (req.body.userEmail) {
    const {
      contentBody,
      contentImage,
      isBookmarked,
      likes,
      likedUserName,
      authorEmail,
      authorName,
    } = req.body;

    const client = req.body.userEmail;

    try {
      const selectedUser = await User.findOne({ userEmail: client });
      if (selectedUser) {
        //Update user's followers list
        await User.updateOne(
          { userEmail: client },
          {
            $push: {
              userContent: {
                authorEmail,
                authorName,
                contentBody,
                contentImage,
                likes: [{ likedUserName }],
                isBookmarked,
                category: selectedUser.registeredBusinesses[0].category,
                authorImage:
                  selectedUser.registeredBusinesses[0].photos[0].image,
              },
            },
          }
        );

        res.status(200).json({ message: "Successfully added a new post" });
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

//Fetch all posts for current user
exports.getAllUserPosts = (req, res) => {
  const currentUser = req?.query?.userEmail;
  if (currentUser) {
    const id = req.query.id;
    var regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

    User.find(regex)
      .then((data) => {
        const userContent = data
          .filter((item) => currentUser.match(new RegExp(item.userEmail), "i"))
          .map((element) => element.userContent);

        res.json(userContent);
      })
      .catch((err) => {
        res.status(404).json({ message: "User was not found" || err.message });
      });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Find all posts where current user's idnetification is found in either the follower or following lists of registered users
//If that is so - then that means one or both parties are following the other - therefore subscribe to their content.
exports.fetchAllPostsFromFollowedAccounts = async (req, res) => {
  try {
    const currentUser = req?.query?.userEmail;
    const getUsers = await User.find();

    if (currentUser) {
      const output = [];
      getUsers.map((data) => {
        const follower = data.followers.some(
          (el) => el.follower === currentUser
        );
        const following = data.following.some(
          (el) => el.follower === currentUser
        );

        if (follower || following) {
          output.push(data.userContent);
        }
      });
      return res.json(output.flat());
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

//Controller for replying timeline posts of followers and of those users whom the current user is following.
exports.replyUserPost = async (req, res) => {
  const client = req.query.userEmail;
  const postId = req.query.id;

  const { commentDate, commentBody, commentBy } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: client, "userContent._id": postId },
      {
        $push: {
          "userContent.$.comments": {
            commentBody: commentBody,
            commentBy: commentBy,
            commentDate: commentDate,
          },
        },
      },
      { new: true }
    );

    if (userToReply) {
      res.status(200).json({ message: "User post successfully replied." });
    } else {
      res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Gets comments for a particular post
exports.getPostComments = async (req, res) => {
  const postId = req.query.id;
  const client = req.query.userEmail;

  await User.findOne({ userEmail: client })
    .then((data) => {
      const specificUserContentComments = data?.userContent.find(
        (element) => element._id.toString() === postId
      );

      if (specificUserContentComments) {
        res.json(specificUserContentComments.comments);
      } else {
        res
          .status(404)
          .json({ message: "Either Content or comments do not exist" });
      }
    })
    .catch((err) => {
      console.warn(err);
    });
};

//Like comments for a particular post
exports.sendLikePost = async (req, res) => {
  const client = req.query.userEmail;
  const postId = req.query.id;

  const { likedUserName, dateLiked } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: client, "userContent._id": postId },
      {
        $push: {
          "userContent.$.likes": {
            likedUserName: likedUserName,
            dateLiked: dateLiked,
            isUnliked: false,
            isLiked: true,
          },
        },
      },
      { new: true }
    );

    if (userToReply) {
      res.status(200).json({ message: "User post successfully liked." });
    } else {
      res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Prevents double likes from same current user, by updating the likes object's isLiked property to false and isUnliked to true
exports.unlikePost = async (req, res) => {
  const client = req.query.userEmail;
  const postId = req.query.id;

  const { likedUserName, dateLiked } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: client, "userContent._id": postId },
      {
        $set: {
          "userContent.$.likes": {
            likedUserName: likedUserName,
            dateLiked: dateLiked,
            isUnliked: true,
            isLiked: false,
          },
        },
      },
      { new: true }
    );

    if (userToReply) {
      res.status(200).json({ message: "User post successfully unliked." });
    } else {
      res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Set Bookmarks for a particular post
exports.saveBookmark = async (req, res) => {
  const client = req.query.userEmail;
  const postId = req.query.id;

  const { isBookmarked } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: client, "userContent._id": postId },
      {
        $set: {
          isBookmarked: isBookmarked,
        },
      },
      { new: true }
    );

    if (userToReply) {
      res.status(200).json({ message: "User post successfully liked." });
    } else {
      res
        .status(404)
        .json({ message: "Either user content or user was not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Returns to us the users whom they current user is not following yet... This will be deprecated
exports.suggestedFollowers = async (req, res) => {
  try {
    const client = req.query.clientUID;

    if (!client) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const id = req.query.id;
    const regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

    const data = await User.find(regex);

    const output = [];

    for (const item of data) {
      const isFollowing = item.following.some((el) => el.follower === client);

      const isFollower = item.followers.some((el) => el.follower === client);

      if (!isFollower && !isFollowing) {
        output.push(item.registeredBusinesses); // Push the user object instead of registered businesses
      }
    }

    const suggestedFollowers = output.slice(0, 5);
    res.json(suggestedFollowers.flat());
  } catch (err) {
    res.status(404).json({
      message: err.message || "User not found or no relationship with user",
    });
  }
};

exports.deleteOnePost = async (req, res) => {
  //Handle error when query params are neither provided nor defined
  const id = req.query.id;
  const client = req.query.userEmail;
  const currentUser = await User.findOne({ userEmail: client });

  if (currentUser) {
    await User.updateOne(
      { userEmail: client },
      {
        $pull: {
          userContent: { _id: id },
        },
      }
    );
    res.status(200).json({ message: "Successfully deleted post." });
  } else {
    console.log("this did not work");
    res.status(500).json({ message: "Internal server error." });
  }
};

//Update one post

exports.editPost = async (req, res) => {
  //Handle error when query params are neither provided nor defined
  if (!req.query || !req.body) {
    res.status(400).json({
      message: "Either Post ID, user, or request body is empty.",
    });

    return;
  }

  //Define query params
  const { id, userEmail } = req.query;
  const { isEdited, contentBody, contentImage } = req.body;
  try {
    const userToUpdate = await User.findOneAndUpdate(
      {
        userEmail: userEmail,
        "userContent._id": id,
      },
      {
        $set: {
          "userContent.$.contentBody": contentBody,
          "userContent.$.contentImage": contentImage,
          "userContent.$.isEdited": isEdited,
        },
      },
      { new: true }
    );

    if (userToUpdate) {
      res.status(200).json({ message: "Post successfully edited." });
    } else {
      res
        .status(404)
        .json({ message: "Either user or Post ID was not found." });
    }
  } catch (err) {
    res.status(500).json({
      message:
        "Internal Server Error! This operation could not be handled by the server." ??
        err.message,
    });
  }
};
