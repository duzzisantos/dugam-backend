const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAccount = new Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    clientUID: {
      type: String,
      unique: true,
    },
    userEmail: {
      type: String,
      unique: true,
    },
    userName: String,
  },
  { timestamps: true }
);

UserAccount.index({ clientUID: 1, userEmail: 1, userId: 1 });
module.exports = mongoose.model("user", UserAccount);
