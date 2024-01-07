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
    const { contentBody, contentImage, isBookmarked, likes, likedUserName } =
      req.body;

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
        const result = [];

        for (const element of data) {
          const followers = element.followers;
          const following = element.following;

          for (const x of followers) {
            for (const y of following) {
              if (
                emailAddress.match(new RegExp(x.followerName), "i") ||
                emailAddress.match(new RegExp(y.followerName))
              ) {
                const flattenedData = element.userContent
                  .flat()
                  .map((file) => ({
                    authorEmail: element.userEmail,
                    authorName: element.userName,
                    authorImage: element.registeredBusinesses
                      .map((el) => el.photos)
                      .map((el) => el.image)[0],
                    contentBody: file.contentBody,
                    contentImage: file.contentImage,
                  }));

                result.push(flattenedData);
              }
            }
          }
        }

        res.json(result[0]);
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
