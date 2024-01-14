const User = require("../models/user");

exports.createMessage = async (req, res) => {
  if (!req.body) {
    throw new Error("Message cannot be empty");
  }

  if (req.body.userEmail) {
    const {
      sender,
      subject,
      sendDate,
      messageBody,
      replies,
      repliedBy,
      replyDate,
    } = req.body;

    const emailAddress = req.body.userEmail;
    if (emailAddress) {
      try {
        const foundUser = await User.findOne({ userEmail: emailAddress });
        if (foundUser) {
          await User.updateOne(
            { userEmail: emailAddress },
            {
              $push: {
                directMessages: {
                  sender: sender,
                  subject: subject,
                  sendDate: sendDate,
                  messageBody: messageBody,
                  replies: [{ repliedBy, replyDate }],
                },
              },
            }
          );
          res
            .status(200)
            .json({ message: "Successfully exchanged direct messages" });
        } else {
          res.status(404).json({ message: "Recipient not found" });
        }
      } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  } else {
    res.status(400).json({
      message:
        "User email for making this request is not contained in the request body.",
    });
  }
};

exports.getMessages = (req, res) => {
  const emailAddress = req.query.userEmail;

  if (emailAddress) {
    User.find({ userEmail: emailAddress })
      .then((data) => {
        const messagesData = data.map((item) => item.directMessages);
        res.json(messagesData);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).json({ message: "An error has occured." });
      });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.replyMessages = async (req, res) => {
  if (req.body.userEmail) {
    const { replyDate, replyMessages, repliedBy, replies } = req.body;
    const emailAddress = req.query.userEmail;

    //We would be using the user email address and message object Id as query parameters in the FE
    try {
      const foundUser = await User.findOne({ userEmail: emailAddress });
      if (foundUser) {
        const messageId = req.query.id;

        //find matching message based on queried ID and push a new reply
        const toBeUpdated = foundUser.directMessages.find(
          (item) => item._id.toString() === messageId
        );

        if (toBeUpdated) {
          toBeUpdated.replies.push({
            repliedBy: repliedBy,
            replyDate: replyDate,
            replyMessages: replyMessages,
          });
        }

        await foundUser.save();
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(400).json({ message: "An error has occured" });
  }
};
