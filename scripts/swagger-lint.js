// Lint for undocumented endpoints in Express route files vs Swagger docs
import fs from "fs";
import path from "path";
import { customSwaggerPaths } from "../src/swagger/index.js";

// Directory containing route files
const ROUTES_DIR = path.resolve("./src/routes");

// Map route file to its mount prefix (as in app.js)
const ROUTE_PREFIXES = {
  "auth.routes.js": "/api/v1/auth",
  "project.routes.js": "/api/v1/projects",
  "task.routes.js": "/api/v1/tasks",
  "board.routes.js": "/api/v1/boards",
  "subtask.routes.js": "/api/v1/subtasks",
  "note.routes.js": "/api/v1/notes",
  "healthcheck.routes.js": "/api/v1/healthcheck",
};

function getExpressRoutes(fileContent) {
  // Match router.route('/path') or router.METHOD('/path')
  const routeRegex =
    /router\.(route|get|post|patch|put|delete)\(['"`]([^'"`]+)['"`]/g;
  const routes = [];
  let match;
  while ((match = routeRegex.exec(fileContent))) {
    let method = match[1] === "route" ? "any" : match[1];
    let route = match[2];
    routes.push({ method, route });
  }
  return routes;
}

function normalizeRoute(route, prefix) {
  // Convert :param to {param} and join with prefix
  let norm = route.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
  if (!norm.startsWith("/")) norm = "/" + norm;
  // Remove trailing slash from prefix if present
  if (prefix.endsWith("/")) prefix = prefix.slice(0, -1);
  // Remove leading slash from norm if present
  if (norm.startsWith("/")) norm = norm.slice(1);
  let full = `${prefix}/${norm}`.replace(/\/\//g, "/");
  // Normalize trailing slash: treat /foo and /foo/ as equivalent
  if (full.endsWith("/")) full = full.slice(0, -1);
  return full;
}

function getSwaggerPaths(swaggerPaths) {
  // Also normalize trailing slashes for Swagger paths
  return Object.keys(swaggerPaths).map((p) =>
    p.endsWith("/") ? p.slice(0, -1) : p,
  );
}

function main() {
  const routeFiles = fs
    .readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith(".js"));
  const allRoutes = [];
  for (const file of routeFiles) {
    const filePath = path.join(ROUTES_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const prefix = ROUTE_PREFIXES[file] || "/api/v1";
    const routes = getExpressRoutes(content).map((r) => ({
      ...r,
      normalized: normalizeRoute(r.route, prefix),
    }));
    allRoutes.push(...routes);
  }
  const swaggerPaths = getSwaggerPaths(customSwaggerPaths);
  const missing = allRoutes.filter((r) => !swaggerPaths.includes(r.normalized));
  if (missing.length === 0) {
    console.log("✅ All Express routes are documented in Swagger.");
    process.exit(0);
  } else {
    console.error("❌ Undocumented endpoints found:");
    for (const m of missing) {
      console.error(
        `  ${m.method.toUpperCase()} ${m.route} (normalized: ${m.normalized})`,
      );
    }
    process.exit(1);
  }
}

main();
