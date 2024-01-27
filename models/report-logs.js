const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportLogs = new Schema(
  {
    reportedBy: String,
    reportedContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedContentBody: String,
    reportedContentAuthor: String,
    reportedUserEmail: String,
    sentimentAnalysis: [
      {
        score: Number,
        comparative: Number,
        tokens: [String],
        words: [String],
        positive: [String],
        negative: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("report_log", ReportLogs);
