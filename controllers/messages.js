const User = require("../models/user");
const Message = require("../models/message");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.createMessage = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "Message cannot be empty");
  }

  if (!req.body.clientUID) {
    return badRequest(res, "User email for making this request is not contained in the request body.");
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
      return notFound(res, "Recipient not found");
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

    return success(res, null, "Successfully exchanged direct messages");
  } catch (err) {
    return error(res);
  }
};

exports.getMessages = async (req, res) => {
  const clientUID = req.query.clientUID;

  if (!clientUID) {
    return badRequest(res, "Client UID is required");
  }

  try {
    const currentUser = await User.findOne({ clientUID });
    if (!currentUser) {
      return notFound(res, "User not found");
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUser.userEmail },
        { receiver: currentUser.userEmail },
      ],
    }).lean();

    return success(res, messages);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.replyMessages = async (req, res) => {
  const { replyDate, replyBody, repliedBy } = req.body;
  const messageId = req.query.id;

  if (!messageId) {
    return badRequest(res, "Message ID is required");
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
      return notFound(res, "Direct message not found");
    }

    return success(res, updatedMessage, "Successfully replied to the message");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
