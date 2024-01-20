const User = require("../models/user");

//performs general search to find out if any of the search queries match any of the registered businesses.
//this should also return a paginated result which shall be controlled in the frontend
exports.getBusinessByAnyParameter = (req, res) => {
  const searchTerm = req.query.searchTerm;
  const id = req.query.id;
  var regex = id ? { $regex: new RegExp(enterprise.id), $options: "gi" } : {};

  User.find(regex)
    .then((data) => {
      const output = [];
      const escapedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      // Create a case-insensitive regular expression with word boundary
      const regex = new RegExp("\\b" + escapedSearchTerm + "\\b", "i");

      for (const business of data) {
        if (
          business.registeredBusinesses.length ||
          business.registeredBusinesses
        ) {
          const businessMatches = business.registeredBusinesses.some(
            (enterprise) =>
              regex.test(enterprise.firstName) ||
              regex.test(enterprise.lastName) ||
              regex.test(enterprise.city) ||
              regex.test(enterprise.category) ||
              regex.test(enterprise.businessName) ||
              regex.test(enterprise.state)
          );

          if (businessMatches) {
            output.push(business.registeredBusinesses);
          }
        } else {
          res.status(404).json({ message: "Business not found" }); /// rEMOVE THIS FEEDBACK IF IT FAILS THE APP
        }
      }
      res.json(output.flat());
    })
    .catch((err) => {
      console.warn(err);
    });
};

//performs narrow exact search to filter out customers who are fall under a specific region/state, city and business category
exports.getBusinessByLimitedSearch = (req, res) => {
  const { region, city, category } = req.query;

  const id = req.query.id;
  var regex = id ? { $regex: new RegExp(enterprise.id), $options: "i" } : {};

  User.find(regex)
    .then((data) => {
      const searchResult = [];

      for (const business of data) {
        if (
          business.registeredBusinesses ||
          business.registeredBusinesses.length
        ) {
          const businessExists = business.registeredBusinesses.some(
            (item) =>
              item.city === city &&
              item.state === region &&
              item.category === category
          );

          if (businessExists) {
            searchResult.push(business.registeredBusinesses);
          }
        } else {
          res
            .status(404)
            .json({ message: "None of the search items was found" });
        }
      }

      return res.json(searchResult.flat());
    })
    .catch((err) => console.error(err));
};
