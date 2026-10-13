const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();

const path = require("path");
const fs = require("fs");
const { resolveAppEnv, allowedOrigins, assertDeployableConfig } = require("./config/env");

const appEnv = resolveAppEnv();
const configProblems = assertDeployableConfig();
if (configProblems.length) {
  console.error("Refusing to start (APP_ENV=" + appEnv + "):\n - " + configProblems.join("\n - "));
  process.exit(1);
}

const app = express();
if (appEnv !== "development") app.set("trust proxy", 1);

// CSP is off because the LOS workspace renders its legacy UI from inline scripts in a srcDoc iframe.
app.use(helmet({ contentSecurityPolicy: false }));
// Camera and location are required by the PD visit evidence flow and need a secure (HTTPS) origin.
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(self), geolocation=(self)");
  next();
});

// CORS: only the configured frontend origin(s). Development keeps the local Vite origin.
const origins = allowedOrigins();
const corsOptions = {
  origin: origins.length ? origins : appEnv === "development" ? ["http://localhost:3001", "http://localhost:3002"] : false,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: "2mb" })); // PD field-visit photos are validated again at the route boundary.

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register requests
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again after an hour.",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/mern-app")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/kyc", require("./routes/kyc"));
app.use("/api/kpi", require("./routes/kpi"));
app.use("/api/journeys", require("./routes/journeys"));
app.use("/api/gl", require("./routes/gl"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Optional single-origin deployment: Express serves the built client so /api needs no CORS and no localhost URLs.
if (process.env.SERVE_CLIENT === "true") {
  const dist = path.resolve(__dirname, process.env.CLIENT_DIST || "../client/dist");
  if (!fs.existsSync(path.join(dist, "index.html"))) {
    console.error("SERVE_CLIENT=true but no client build found at " + dist + ". Run the client build first.");
    process.exit(1);
  }
  app.use(express.static(dist, { index: false }));
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running on port", PORT, "(APP_ENV=" + appEnv + ")"));