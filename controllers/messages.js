const User = require("../models/user");

exports.createMessage = async (req, res) => {
  if (!req.body) {
    throw new Error("Message cannot be empty");
  }

  if (req.body.clientUID) {
    const {
      sender,
      subject,
      sendDate,
      receiver,
      messageBody,
      replies,
      repliedBy,
      replyDate,
      replyBody,
    } = req.body;

    const client = req.body.clientUID;
    if (client) {
      try {
        const foundUser = await User.findOne({ clientUID: client });
        if (foundUser) {
          await User.updateOne(
            { clientUID: client },
            {
              $push: {
                directMessages: {
                  sender: sender,
                  receiver: receiver,
                  subject: subject,
                  sendDate: sendDate,
                  messageBody: messageBody,
                  clientUID: client,
                  replies: [{ repliedBy, replyDate, replyBody }],
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

exports.getMessages = async (req, res) => {
  const clientUID = req.query.clientUID;

  if (clientUID) {
    const currentUser = await User.findOne({ clientUID: clientUID });
    const currentUserEmail = currentUser.userEmail;

    User.find()
      .then((data) => {
        const output = [];

        data.forEach((element) => {
          element.directMessages.forEach((item) => {
            if (
              item.sender === currentUserEmail ||
              item.receiver === currentUserEmail
            ) {
              output.push(item);
            }
          });
        });
        res.json(output);
        return output.flat();
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
  const { replyDate, replyBody, repliedBy } = req.body;
  const client = req.query.clientUID;
  const messageId = req.query.id; // Assuming messageId is a route parameter

  console.log({ client, messageId, repliedBy });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { clientUID: client, "directMessages._id": messageId },
      {
        $push: {
          "directMessages.$.replies": {
            repliedBy: repliedBy,
            replyDate: replyDate,
            replyBody: replyBody,
          },
        },
      },
      { new: true } // To return the updated document
    );

    if (updatedUser) {
      res.status(200).json({ message: "Successfully replied to the message" });
    } else {
      res
        .status(404)
        .json({ message: "Direct message not found or user not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
