const User = require("../models/user");
const Post = require("../models/post");
const Report = require("../models/report-logs");
const { getDelayedFeedback } = require("../utilities/getDelayedFeedback");
const Sentiment = require("sentiment");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.createReport = async (req, res) => {
  try {
    if (!req.body) {
      return badRequest(res, "Report log cannot be empty. Request body is required.");
    }

    const email = req.query.userEmail;
    const contentId = req.query.id;
    const reportedBy = req.query.reportedBy;

    const foundUser = await User.findOne({ userEmail: email });
    if (!foundUser) {
      return notFound(res, "User not found");
    }

    const foundContent = await Post.findById(contentId);
    if (!foundContent) {
      return notFound(res, "Resource not found");
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
    getDelayedFeedback(data, User);
    return success(res, data, "Report submitted successfully");
  } catch (err) {
    return error(res);
  }
};
