const User = require("../models/user");
const Post = require("../models/post");
const Report = require("../models/report-logs");
const { getDelayedFeedback } = require("../utilities/getDelayedFeedback");
const Sentiment = require("sentiment");

exports.createReport = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Report log cannot be empty. Request body is required.",
      });
    }

    const email = req.query.userEmail;
    const contentId = req.query.id;
    const reportedBy = req.query.reportedBy;

    const foundUser = await User.findOne({ userEmail: email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const foundContent = await Post.findById(contentId);
    if (!foundContent) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const sentiment = new Sentiment();
    const analysis = sentiment.analyze(foundContent.contentBody);

    const { authorName, contentBody, _id, authorEmail } = foundContent;
    const { comparative, score, tokens, words, positive, negative } = analysis;

    const report = new Report({
      reportedBy,
      reportedContentAuthor: authorName,
      reportedContentBody: contentBody,
      reportedContentId: _id,
      reportedUserEmail: authorEmail,
      sentimentAnalysis: [
        { comparative, score, tokens, words, positive, negative },
      ],
    });

    const data = await report.save();
    res.json(data);
    getDelayedFeedback(data, User);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
