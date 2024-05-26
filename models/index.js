//index for data models
const dbConfig = require("../config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("./user")(mongoose);
db.reportLogs = require("./report-logs")(mongoose);

module.exports = db;
