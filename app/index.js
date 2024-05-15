require("dotenv").config();
process.env.NODE_ENV = "production";
const express = require("express");
const app = express();
const cors = require("cors");
const { jwtDecode } = require("jwt-decode");
const RateLimit = require("express-rate-limit");
const db = require("../models");
const helmet = require("helmet");
const methodOverride = require("method-override");
const mongoSanitize = require("express-mongo-sanitize");

//database connection settings
db.mongoose
  .connect(db.url ?? process.env.MONGO_URI)
  .then(() => {
    console.log("Connection established with database");
  })
  .catch((err) => {
    if (err) {
      console.log("Database connection error!", err);
      process.exit();
    }
  });

const isLocal = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProduction
    ? process.env.REACT_APP_CLIENT_HOSTNAME
    : isLocal && "http://localhost:3000",
  methods: "GET POST PUT DELETE",
};

const rateLimiter = RateLimit({
  windowMs: 1 * 60 * 100,
  max: 50,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(helmet());
app.use(rateLimiter);

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "http://localhost:3000"], //only scripts from this host
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      upgradeInsecureRequests: [],
      objectSrc: ["'none'"],
    },
  })
);

app.use(helmet.crossOriginEmbedderPolicy());
app.use(
  helmet.referrerPolicy({
    options: "no referrer",
  })
);

//https settings for secure connections
app.use(
  helmet.hsts({
    maxAge: 15552000,
    preload: true,
    includeSubDomains: false,
  })
);

app.use(helmet.noSniff()); //mitigates data sniffing by hackers
app.use(helmet.xssFilter()); //prevents cross-site scripting

//REST API routes
require("../routes/register")(app);
require("../routes/signup")(app);
require("../routes/followers")(app);
require("../routes/user-content")(app);
require("../routes/ratings")(app);
require("../routes/messages")(app);
require("../routes/business-query")(app);
require("../routes/report-logs")(app);

//Error handler
app.use("/", (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Backend Error!");
  return next(err);
});

//MiddleWare for checking authorized users
app.use((req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const decodedToken = jwtDecode(token);

  if (decodedToken.aud === process.env.REACT_APP_AUTHORIZATION_AUD) {
    req.decodedToken = decodedToken;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized Access" });
  }
});

const PORT = 8080;
app.listen(PORT, (err) => {
  !err ? console.log("LISTENING TO PORT", PORT) : console.log(err);
});
