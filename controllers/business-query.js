const Business = require("../models/business");

exports.getBusinessByAnyParameter = async (req, res) => {
  const searchTerm = req.query.searchTerm;

  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
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

    res.json(businesses);
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getBusinessByLimitedSearch = async (req, res) => {
  const { region, city, category } = req.query;

  if (!region || !city || !category) {
    return res
      .status(400)
      .json({ message: "Region, city, and category are required" });
  }

  try {
    const businesses = await Business.find({
      city,
      state: region,
      category,
    }).lean();

    if (!businesses.length) {
      return res
        .status(404)
        .json({ message: "None of the search items was found" });
    }

    res.json(businesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
