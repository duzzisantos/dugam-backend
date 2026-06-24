const dbConfig = require("../config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("./user");
db.business = require("./business");
db.rating = require("./rating");
db.follow = require("./follow");
db.post = require("./post");
db.message = require("./message");
db.reportLogs = require("./report-logs");
db.mediaUploads = require("./media-upload");
db.apiLog = require("./api-log");

module.exports = db;
