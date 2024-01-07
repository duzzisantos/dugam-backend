const User = require("../models/user");
exports.createBusiness = async (req, res) => {
  if (!req.body) {
    res.status(400).json({
      message:
        "Request body cannot be empty. You must fill the registration form!",
    });
    return;
  }

  if (req.body.userName && req.body.userId && req.body.userEmail) {
    const {
      businessID,
      firstName,
      lastName,
      businessName,
      address,
      email,
      businessPhone,
      category,
      photos,
      imageId,
      image,
    } = req.body;
    const emailAddress = req.body.userEmail;

    try {
      const foundUser = await User.findOne({ userEmail: emailAddress });
      if (foundUser) {
        await User.updateOne(
          { userEmail: emailAddress },
          {
            $push: {
              registeredBusinesses: {
                businessID,
                firstName,
                lastName,
                businessName,
                address,
                email,
                businessPhone,
                category,
                photos: [{ imageId, image }],
              },
            },
          }
        );

        res
          .status(200)
          .json({ message: "Successfully registered new business" });
      } else {
        res
          .status(404)
          .json({ message: "User was not found. Please try again." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Certain fields on the form are missing" });
  }
};

exports.findAll = async (req, res) => {
  // //Read (all data)

  const vendorID = req.query.id;
  var condition = vendorID
    ? { $regex: new RegExp(vendorID), $options: "i" }
    : {};
  User.find(condition)
    .then((data) => {
      //Return only registered business details - since they are open to the public for viewing
      const enrolledBusinesses = data.map(
        (element) => element.registeredBusinesses
      );
      res.json(enrolledBusinesses);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving all vendors" });
    });
};

exports.findOne = (req, res) => {
  const emailAddress = req.query.userEmail;
  if (emailAddress) {
    User.findOne({ userEmail: emailAddress }).then((data) => {
      !data
        ? res.status(500).json({ message: `Vendor not found!` })
        : res.json(data);
    });
  }
};

// //Update
// exports.update = (req, res) => {
//   const id = req.params.id;
//   Registered.findByIdAndUpdate(id, { $set: req.body }, (err, data, next) => {
//     if (err) {
//       console.log(err);
//       return next(err);
//     } else {
//       res.status(200).json(data);
//       console.log(`Vendor information was updated successfully!`);
//     }
//   });
// };

// //Delete (One)
// exports.delete = (req, res) => {
//   const id = req.params.id;
//   Registered.findByIdAndRemove(id)
//     .then((data) => {
//       !data
//         ? res.status(404).json({ message: `ID ${id} not found!` })
//         : res.status(200).json(data);
//       console.log("Vendor information was deleted successfully!");
//     })
//     .catch((err) => {
//       res.status(500).json({
//         message: "Error in removing vendor information!" || err.message,
//       });
//     });
// };

// //Delete (All) - Dangerous!
// exports.deleteAll = (req, res) => {
//   Registered.deleteMany({})
//     .then((data) => {
//       res.status(200).json({
//         message: "All vendors have been deleted!",
//         data,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         message:
//           err.message || "Error occured in deleting all vendor information!",
//       });
//     });
// };
