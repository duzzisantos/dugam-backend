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

    const emailAddress = req.body.userEmail;

    try {
      const selectedUser = await User.findOne({ userEmail: emailAddress });
      if (selectedUser) {
        //Update user's followers list
        await User.updateOne(
          { userEmail: emailAddress },
          {
            $push: {
              userContent: {
                authorEmail,
                authorName,
                contentBody,
                contentImage,
                likes: [{ likedUserName }],
                isBookmarked,
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
  const emailAddress = req.query.userEmail;
  if (emailAddress) {
    const id = req.query.id;
    var regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

    User.find(regex)
      .then((data) => {
        const userContent = data
          .filter((item) => emailAddress.match(new RegExp(item.userEmail), "i"))
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

//Find all posts from subscribed-to users
exports.fetchAllPostsFromFollowedAccounts = (req, res) => {
  const emailAddress = req.query.userEmail;

  if (emailAddress) {
    const id = req.query.id;
    var regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

    User.find(regex)
      .then((data) => {
        const output = [];
        for (const element of data) {
          const followers = element.followers;
          const following = element.following;

          for (const item of followers) {
            for (const file of following) {
              if (
                emailAddress.includes(file.followerName) &&
                emailAddress.includes(item.followerName) &&
                item.hasFollowed === true
              ) {
                output.push(element.userContent);
              }
            }
          }
        }
        return res.json(output.flat());
      })
      .catch((err) => {
        res.status(404).json({
          message: err.message || "User not found or no relationship with user",
        });
      });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Controller for replying timeline posts of followers and of those users whom the current user is following.
exports.replyUserPost = async (req, res) => {
  const emailAddress = req.query.userEmail;
  const postId = req.query.id;

  const { commentDate, commentBody, commentBy } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: emailAddress, "userContent._id": postId },
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
exports.getPostComments = (req, res) => {
  const postId = req.query.id;
  const emailAddress = req.query.userEmail;

  User.findOne({ userEmail: emailAddress })
    .then((data) => {
      const specificUserContentComments = data.userContent.find(
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
  const emailAddress = req.query.userEmail;
  const postId = req.query.id;

  const { likedUserName, dateLiked, isUnliked } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: emailAddress, "userContent._id": postId },
      {
        $push: {
          "userContent.$.likes": {
            likedUserName: likedUserName,
            dateLiked: dateLiked,
            isUnliked: isUnliked,
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

//Set Bookmarks for a particular post
exports.saveBookmark = async (req, res) => {
  const emailAddress = req.query.userEmail;
  const postId = req.query.id;

  const { isBookmarked } = req.body;

  try {
    const userToReply = await User.findOneAndUpdate(
      { userEmail: emailAddress, "userContent._id": postId },
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

//Returns to us the users whom they current user is not following yet...
exports.suggestedFollowers = async (req, res) => {
  try {
    const emailAddress = req.query.userEmail;

    if (!emailAddress) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const id = req.query.id;
    const regex = id ? { $regex: new RegExp(id), $options: "i" } : {};

    const data = await User.find(regex);

    const output = [];

    for (const item of data) {
      const isFollowing = item.following.some(
        (el) => el.followerName === emailAddress
      );

      const isFollower = item.followers.some(
        (el) => el.followerName === emailAddress
      );

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
