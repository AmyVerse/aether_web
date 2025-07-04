#!/usr/bin/env node
/**
 * API Cleanup Utility
 * Helps identify unused API routes in the codebase
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get all API routes
function getApiRoutes(dir) {
  const routes = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      routes.push(...getApiRoutes(fullPath));
    } else if (file.name === "route.ts") {
      // Convert file path to API endpoint
      const apiPath = fullPath
        .replace(process.cwd(), "")
        .replace(/\\/g, "/")
        .replace("/src/app/api", "/api")
        .replace("/route.ts", "")
        .replace(/\/\[([^\]]+)\]/g, "/:$1"); // Convert [param] to :param
      routes.push(apiPath);
    }
  }
  return routes;
}

// Check if API route is used in codebase
function isApiUsed(apiRoute) {
  try {
    // Remove parameter syntax for searching
    const searchPattern = apiRoute.replace(/:[\w]+/g, "");
    const result = execSync(
      `findstr /r /i "${searchPattern}" src\\*.tsx src\\*.ts src\\components\\*.tsx src\\components\\*.ts 2>nul || echo "NOT_FOUND"`,
      { encoding: "utf8" },
    );
    return !result.includes("NOT_FOUND") && result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Main function
function analyzeApis() {
  const apiDir = path.join(process.cwd(), "src", "app", "api");
  if (!fs.existsSync(apiDir)) {
    console.log("No API directory found");
    return;
  }

  const routes = getApiRoutes(apiDir);
  console.log("=== API Route Analysis ===\n");

  const unused = [];
  const used = [];

  for (const route of routes) {
    const isUsed = isApiUsed(route);
    if (isUsed) {
      used.push(route);
      console.log(`✅ USED: ${route}`);
    } else {
      unused.push(route);
      console.log(`❌ UNUSED: ${route}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total routes: ${routes.length}`);
  console.log(`Used routes: ${used.length}`);
  console.log(`Unused routes: ${unused.length}`);

  if (unused.length > 0) {
    console.log("\n=== Potentially Safe to Remove ===");
    unused.forEach((route) => console.log(`- ${route}`));
  }
}

if (require.main === module) {
  analyzeApis();
}

module.exports = { analyzeApis, getApiRoutes, isApiUsed };
