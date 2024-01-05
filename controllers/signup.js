const UserSchema = require("../models/user");

exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).json({
      message: "Request body cannot be left empty.Please fill form properly.",
    });
    return;
  }

  const { userId, userEmail, userName } = req.body;
  const signup = new UserSchema({ userId, userEmail, userName });

  await signup
    .save(signup)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

//Find customer by comparing email from auth and database
exports.findOne = async (req, res) => {
  const userEmail = req.query.userEmail;
  UserSchema.find({ userEmail })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.error(err));
};
