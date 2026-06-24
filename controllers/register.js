const User = require("../models/user");
const Business = require("../models/business");

exports.createBusiness = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message:
        "Request body cannot be empty. You must fill the registration form!",
    });
  }

  if (!req.body.userName || !req.body.userId || !req.body.userEmail) {
    return res
      .status(400)
      .json({ message: "Certain fields on the form are missing" });
  }

  const {
    businessID,
    firstName,
    lastName,
    businessName,
    address,
    email,
    city,
    state,
    businessPhone,
    category,
    clientUID,
  } = req.body;

  try {
    const foundUser = await User.findOne({ clientUID });
    if (!foundUser) {
      return res
        .status(404)
        .json({ message: "User was not found. Please try again." });
    }

    const business = await Business.create({
      owner: foundUser._id,
      ownerClientUID: clientUID,
      ownerEmail: foundUser.userEmail,
      businessID,
      firstName,
      lastName,
      businessName,
      address,
      city,
      state,
      email,
      businessPhone,
      category,
    });

    res
      .status(200)
      .json({ message: "Successfully registered new business", data: business });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.findAll = async (req, res) => {
  try {
    const businesses = await Business.find().lean();
    res.json(businesses);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving all vendors" });
  }
};

exports.getAllBusinessCategories = async (req, res) => {
  try {
    const categories = await Business.distinct("category");
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving all categories" });
  }
};

exports.getAllCities = async (req, res) => {
  try {
    const cities = await Business.distinct("city");
    res.json(cities);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving all categories" });
  }
};

exports.getAllStates = async (req, res) => {
  try {
    const states = await Business.distinct("state");
    res.json(states);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving all categories" });
  }
};

exports.getBusinessByLocation = async (req, res) => {
  try {
    const businesses = await Business.aggregate([
      {
        $group: {
          _id: "$state",
          businesses: {
            $push: { category: "$category", city: "$city", state: "$state" },
          },
        },
      },
    ]);

    const grouped = {};
    for (const item of businesses) {
      grouped[item._id] = item.businesses;
    }
    res.json(grouped);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error in retrieving data" });
  }
};

exports.findOne = async (req, res) => {
  try {
    const client = req.query.clientUID;
    if (!client) {
      return res.status(404).json({ message: "User not Found" });
    }

    const businesses = await Business.find({ ownerClientUID: client }).lean();
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body cannot be empty." });
  }

  try {
    const client = req.query.clientUID;
    if (!client) {
      return res.status(400).json({ message: "Client UID is required." });
    }

    const business = await Business.findOneAndUpdate(
      { ownerClientUID: client },
      { $set: req.body },
      { new: true }
    );

    if (!business) {
      return res
        .status(404)
        .json({ message: "Registered business not found" });
    }

    res.json(business);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
