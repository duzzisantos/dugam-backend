const Message = require("../models/message");

exports.getDelayedFeedback = (report, User) => {
  setTimeout(async () => {
    const userToReceiveCorrespondence = await User.findOne({
      userEmail: report.reportedBy,
    });
    if (userToReceiveCorrespondence) {
      await Message.create({
        sender: "Dugam Administrator (Do not reply)",
        receiver: report.reportedBy,
        subject: `Regarding your report against ${report.reportedContentAuthor}`,
        sendDate: new Date(Date.now()).toDateString(),
        messageBody: `Dear ${
          userToReceiveCorrespondence.userName ?? report.reportedBy
        }. We have investigated your report about ${
          report.reportedContentAuthor
        }'s content and have concluded that based on the data we have that - it ${verdict(
          report
        )}`,
        clientUID: userToReceiveCorrespondence.clientUID,
        replies: [],
      });
    }
  }, 1000 * 60 * 60);
};

function verdict(report) {
  const { positive, negative, score } = report.sentimentAnalysis[0];
  if (positive.length > negative.length && score > 0) {
    return "is not against our rules and regulations for usage. However, if you decide to see less of their content, you may want to block or unfollow them.";
  } else {
    return "is against our rules and regulations for usage. You can block or unfollow them right away. We apologise for the inconvenience.";
  }
}
