require("dotenv").config();
process.env.NODE_ENV = "production";
const express = require("express");
const app = express();
const db = require("../models");
const { handleAuthorization } = require("../utilities/handleAuthorization.js");
const { handleError } = require("../utilities/handleError.js");
const { handleProtect } = require("../utilities/handleProtection.js");
const { useDataBase } = require("../utilities/useDataBase.js");
const { useRoutes } = require("../utilities/useRoutes.js");

useDataBase(db);
handleProtect(app, express);
useRoutes(app);
handleError(app);
handleAuthorization(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", (err) => {
  !err ? console.log("LISTENING TO PORT", PORT) : console.log(err);
});
