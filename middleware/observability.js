const ApiLog = require("../models/api-log");

function observability(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;

    ApiLog.create({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      url: req.originalUrl,
      ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      statusCode: res.statusCode,
      responseTime: Math.round(duration * 100) / 100,
      contentLength: parseInt(res.getHeader("content-length") || "0", 10),
    }).catch(() => {});
  });

  next();
}

module.exports = { observability };
