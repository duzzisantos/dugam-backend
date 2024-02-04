const User = require("../models/user");
const Report = require("../models/report-logs");
const { getDelayedFeedback } = require("../utilities/getDelayedFeedback");
const Sentiment = require("sentiment");

exports.createReport = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        message: "Report log cannot be empty. Request body is required.",
      });
    }

    const email = req.query.userEmail;
    const contentId = req.query.id;
    const reportedBy = req.query.reportedBy;

    const foundUser = await User.findOne({ userEmail: email });

    if (foundUser) {
      const foundContent = Object.values(foundUser.userContent).find(
        (element) => element.id === contentId
      );

      if (foundContent) {
        const sentiment = new Sentiment();
        const analysis = sentiment.analyze(foundContent.contentBody);
        const report = new Report({
          reportedBy: reportedBy,
          reportedContentAuthor: foundContent.authorName,
          reportedContentBody: foundContent.contentBody,
          reportedContentId: foundContent.id,
          reportedUserEmail: foundContent.authorEmail,
          sentimentAnalysis: [
            {
              comparative: analysis.comparative,
              score: analysis.score,
              tokens: analysis.tokens,
              words: analysis.words,
              positive: analysis.positive,
              negative: analysis.negative,
            },
          ],
        });

        await report
          .save(report)
          .then((data) => {
            res.json(data);
            return getDelayedFeedback(data, User); //return automated investigation feedback to the user who reported content - after 1 hour
          })
          .catch((err) => console.warn(err.message));
      } else {
        res.status(404).json({ message: "Resource not found" });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
