const UserSchema = require("../models/user");
const { success, error, badRequest } = require("../utilities/response");

exports.create = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "Request body cannot be left empty. Please fill form properly.");
  }

  const { userId, userEmail, userName } = req.body;
  const signup = new UserSchema({ userId, userEmail, userName });

  try {
    const data = await signup.save();
    return success(res, data, "User created successfully");
  } catch (err) {
    console.log(err.message);
    return error(res, "Internal Server Error");
  }
};

exports.findOne = async (req, res) => {
  const userEmail = req.query.userEmail;

  try {
    const data = await UserSchema.find({ userEmail });
    return success(res, data);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.updateUsers = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "The request body cannot be empty");
  }

  try {
    const email = req.query.userEmail;
    await UserSchema.updateOne({ userEmail: email }, { $set: req.body });
    return success(res, null, "Successfully added client ID");
  } catch (err) {
    console.error(err.message);
    return error(res);
  }
};
