const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportLogs = new Schema(
  {
    reportedContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedContentBody: String,
    reportedContentAuthor: String,
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sentimentAnalysis: [
      { score: Number, comparative: Number, verdict: String },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("report_log", ReportLogs);
