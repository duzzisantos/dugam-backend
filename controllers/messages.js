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
