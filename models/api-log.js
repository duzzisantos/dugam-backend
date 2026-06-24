const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApiLogSchema = new Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  method: String,
  route: String,
  url: String,
  ip: String,
  userAgent: String,
  statusCode: Number,
  responseTime: Number,
  contentLength: Number,
});

ApiLogSchema.index({ timestamp: -1 });
ApiLogSchema.index({ route: 1, timestamp: -1 });

module.exports = mongoose.model("api_log", ApiLogSchema);
