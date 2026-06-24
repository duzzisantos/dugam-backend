const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: {
      type: String,
      required: true,
      index: true,
    },
    receiver: {
      type: String,
      required: true,
      index: true,
    },
    subject: String,
    sendDate: String,
    messageBody: String,
    clientUID: String,
    replies: [
      {
        repliedBy: String,
        replyDate: String,
        replyBody: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", MessageSchema);
