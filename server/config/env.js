// APP_ENV is the explicit deployment profile: development | demo | production.
// It is deliberately independent of NODE_ENV, which hosting platforms set to "production" for every deployment.
const PROFILES = ["development", "demo", "production"];
const DEMO_AUTH_PROFILES = ["development", "demo"];

function resolveAppEnv(env = process.env) {
  const value = String(env.APP_ENV || "").trim().toLowerCase();
  if (PROFILES.includes(value)) return value;
  return env.NODE_ENV === "production" ? "production" : "development";
}

function demoAuthEnabled(env = process.env) {
  return env.ENABLE_DEMO_AUTH === "true" && DEMO_AUTH_PROFILES.includes(resolveAppEnv(env));
}

function allowedOrigins(env = process.env) {
  return String(env.CLIENT_ORIGIN || "").split(",").map((item) => item.trim()).filter(Boolean);
}

// Fail fast instead of silently running a deployed profile with development fallbacks.
function assertDeployableConfig(env = process.env) {
  const appEnv = resolveAppEnv(env);
  const problems = [];
  if (appEnv === "production" && env.ENABLE_DEMO_AUTH === "true") problems.push("ENABLE_DEMO_AUTH=true is not allowed when APP_ENV=production");
  if (appEnv !== "development") {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) problems.push("JWT_SECRET must be set to at least 32 characters");
    if (!env.MONGO_URI) problems.push("MONGO_URI must be set");
    if (env.SERVE_CLIENT !== "true" && !allowedOrigins(env).length) problems.push("CLIENT_ORIGIN must list the deployed frontend origin (or set SERVE_CLIENT=true for a single-origin deployment)");
  }
  return problems;
}

module.exports = { resolveAppEnv, demoAuthEnabled, allowedOrigins, assertDeployableConfig };
