const RateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

exports.handleProtect = (app, express) => {
  const isLocal = process.env.NODE_ENV === "development";

  var corsOptions = {
    origin: isLocal ? "http://localhost:3000" : process.env.CLIENT_HOSTNAME,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"], // Add required headers
    credentials: true, // If you need to include cookies in CORS requests
  };

  const limiter = RateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
    message:
      "There are too many requests from this IP Address. Please try again after some time.",
  });

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(limiter);
  app.use(helmet());

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
        scriptSrc: ["'self'", "http://localhost:3000/"], //only scripts from this host
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

  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
};
