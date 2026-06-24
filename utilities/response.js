exports.success = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

exports.created = (res, data, message = "Resource created successfully") => {
  return exports.success(res, data, message, 201);
};

exports.error = (res, message = "Internal Server Error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

exports.notFound = (res, message = "Resource not found") => {
  return exports.error(res, message, 404);
};

exports.badRequest = (res, message = "Bad request") => {
  return exports.error(res, message, 400);
};

exports.unauthorized = (res, message = "Unauthorized Access") => {
  return exports.error(res, message, 401);
};
