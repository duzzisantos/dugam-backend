const User = require("../models/user");
const Message = require("../models/message");

exports.createMessage = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  if (!req.body.clientUID) {
    return res.status(400).json({
      message:
        "User email for making this request is not contained in the request body.",
    });
  }

  const {
    sender,
    subject,
    sendDate,
    receiver,
    messageBody,
    repliedBy,
    replyDate,
    replyBody,
    clientUID,
  } = req.body;

  try {
    const foundUser = await User.findOne({ clientUID });
    if (!foundUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    await Message.create({
      sender,
      receiver,
      subject,
      sendDate,
      messageBody,
      clientUID,
      replies: repliedBy ? [{ repliedBy, replyDate, replyBody }] : [],
    });

    res
      .status(200)
      .json({ message: "Successfully exchanged direct messages" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMessages = async (req, res) => {
  const clientUID = req.query.clientUID;

  if (!clientUID) {
    return res.status(400).json({ message: "Client UID is required" });
  }

  try {
    const currentUser = await User.findOne({ clientUID });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUser.userEmail },
        { receiver: currentUser.userEmail },
      ],
    }).lean();

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.replyMessages = async (req, res) => {
  const { replyDate, replyBody, repliedBy } = req.body;
  const messageId = req.query.id;

  if (!messageId) {
    return res.status(400).json({ message: "Message ID is required" });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $push: {
          replies: { repliedBy, replyDate, replyBody },
        },
      },
      { new: true }
    );

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ message: "Direct message not found" });
    }

    res.status(200).json({ message: "Successfully replied to the message" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
