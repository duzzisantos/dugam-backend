const User = require("../models/user");
const Business = require("../models/business");
const { invalidateCache } = require("../middleware/cache");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.createBusiness = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "Request body cannot be empty. You must fill the registration form!");
  }

  if (!req.body.userName || !req.body.userId || !req.body.userEmail) {
    return badRequest(res, "Certain fields on the form are missing");
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
      return notFound(res, "User was not found. Please try again.");
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

    invalidateCache("businesses");
    invalidateCache("categories");
    invalidateCache("cities");
    invalidateCache("regions");
    invalidateCache("grouped");

    return success(res, business, "Successfully registered new business");
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

exports.findAll = async (req, res) => {
  try {
    const businesses = await Business.find().lean();
    return success(res, businesses);
  } catch (err) {
    return error(res, err.message || "Error in retrieving all vendors");
  }
};

exports.getAllBusinessCategories = async (req, res) => {
  try {
    const categories = await Business.distinct("category");
    return success(res, categories);
  } catch (err) {
    return error(res, err.message || "Error in retrieving all categories");
  }
};

exports.getAllCities = async (req, res) => {
  try {
    const cities = await Business.distinct("city");
    return success(res, cities);
  } catch (err) {
    return error(res, err.message || "Error in retrieving all cities");
  }
};

exports.getAllStates = async (req, res) => {
  try {
    const states = await Business.distinct("state");
    return success(res, states);
  } catch (err) {
    return error(res, err.message || "Error in retrieving all states");
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
    return success(res, grouped);
  } catch (err) {
    return error(res, err.message || "Error in retrieving data");
  }
};

exports.findOne = async (req, res) => {
  try {
    const client = req.query.clientUID;
    if (!client) {
      return notFound(res, "User not found");
    }

    const businesses = await Business.find({ ownerClientUID: client }).lean();
    return success(res, businesses);
  } catch (err) {
    return error(res);
  }
};

exports.update = async (req, res) => {
  if (!req.body) {
    return badRequest(res, "Request body cannot be empty.");
  }

  try {
    const client = req.query.clientUID;
    if (!client) {
      return badRequest(res, "Client UID is required.");
    }

    const business = await Business.findOneAndUpdate(
      { ownerClientUID: client },
      { $set: req.body },
      { new: true }
    );

    if (!business) {
      return notFound(res, "Registered business not found");
    }

    invalidateCache("businesses");
    invalidateCache("categories");
    invalidateCache("cities");
    invalidateCache("regions");
    invalidateCache("grouped");

    return success(res, business, "Successfully updated business");
  } catch (err) {
    return error(res);
  }
};
