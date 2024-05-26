const User = require("../models/user");
const groupBy = require("core-js/actual/array/group-by");

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
                photos,
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

//Make this modular
exports.getAllBusinessCategories = (req, res) => {
  const vendorID = req.query.id;
  var condition = vendorID
    ? { $regex: new RegExp(vendorID), $options: "i" }
    : {};
  User.find(condition)
    .then((data) => {
      //Return only unique business categories
      const enrolledBusinesses = data.map((element) => [
        ...new Set(element.registeredBusinesses.map((el) => el.category)),
      ]);

      res.json(enrolledBusinesses.flat());
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving all categories" });
    });
};

exports.getAllCities = (req, res) => {
  const vendorID = req.query.id;
  var condition = vendorID
    ? { $regex: new RegExp(vendorID), $options: "i" }
    : {};
  User.find(condition)
    .then((data) => {
      //Return only unique business categories
      const enrolledBusinesses = data.map((element) => [
        ...new Set(element.registeredBusinesses.map((el) => el.city)),
      ]);

      res.json(enrolledBusinesses.flat());
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving all categories" });
    });
};

exports.getAllStates = (req, res) => {
  const vendorID = req.query.id;
  var condition = vendorID
    ? { $regex: new RegExp(vendorID), $options: "i" }
    : {};
  User.find(condition)
    .then((data) => {
      //Return only unique business categories
      const enrolledBusinesses = data.map((element) => [
        ...new Set(element.registeredBusinesses.map((el) => el.state)),
      ]);

      res.json(enrolledBusinesses.flat());
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving all categories" });
    });
};

exports.getBusinessByLocation = (req, res) => {
  const vendorID = req.query.id;
  var condition = vendorID
    ? { $regex: new RegExp(vendorID), $options: "i" }
    : {};

  User.find(condition)
    .then((data) => {
      const registeredBusinesses = data
        .map((el) => el.registeredBusinesses[0])
        .map((item) => ({
          category: item?.category,
          city: item?.city,
          state: item?.state,
        }));

      const groupedBusinessByLocation = groupBy(
        registeredBusinesses,
        ({ state }) => state
      );

      console.log(groupedBusinessByLocation);
      res.json(groupedBusinessByLocation);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message || "Error in retrieving data" });
    });
};

exports.findOne = async (req, res) => {
  try {
    const client = req.query.clientUID;
    if (client) {
      const foundUser = await User.findOne({ clientUID: client });
      res.json(foundUser.registeredBusinesses);
    } else {
      res.status(404).json({ message: "User not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// //Update registered business
exports.update = async (req, res) => {
  if (req.body) {
    try {
      const client = req.query.clientUID;

      if (client) {
        const foundUser = await User.findOne({ clientUID: client });

        if (foundUser) {
          const registeredBusinesses = foundUser.registeredBusinesses;
          registeredBusinesses.splice(0, 1);
          registeredBusinesses.push(req.body);

          await foundUser.save();
          res.json(registeredBusinesses);
        } else {
          res.status(404).json({ message: "Registered business not found" });
        }
      }
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Request body cannot be empty." });
  }
};

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
