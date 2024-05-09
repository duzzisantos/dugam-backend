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

//Helps us to add client ID to user when they are registering business, that way - all other queries are
//made with the client ID (auth UID)

exports.updateUsers = async (req, res) => {
  if (req.body) {
    try {
      const email = req.query.userEmail;

      await UserSchema.updateOne({ userEmail: email }, { $set: req.body });
      res.status(200).json({ message: "Successfully added client ID" });
    } catch (err) {
      console.error(err.message);
    }
  } else {
    console.error("The request body cannot be empty");
  }
};
