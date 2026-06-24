const Business = require("../models/business");
const { success, error, notFound, badRequest } = require("../utilities/response");

exports.getBusinessByAnyParameter = async (req, res) => {
  const searchTerm = req.query.searchTerm;

  if (!searchTerm) {
    return badRequest(res, "Search term is required");
  }

  try {
    const escapedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp("\\b" + escapedSearchTerm + "\\b", "i");

    const businesses = await Business.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { city: regex },
        { category: regex },
        { businessName: regex },
        { state: regex },
      ],
    }).lean();

    return success(res, businesses);
  } catch (err) {
    console.warn(err);
    return error(res);
  }
};

exports.getBusinessByLimitedSearch = async (req, res) => {
  const { region, city, category } = req.query;

  if (!region || !city || !category) {
    return badRequest(res, "Region, city, and category are required");
  }

  try {
    const businesses = await Business.find({
      city,
      state: region,
      category,
    }).lean();

    if (!businesses.length) {
      return notFound(res, "None of the search items was found");
    }

    return success(res, businesses);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
