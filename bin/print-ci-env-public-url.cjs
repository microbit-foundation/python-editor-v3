#!/usr/bin/env node
let baseUrl;
if (process.env.GITHUB_REPOSITORY_OWNER === "microbit-foundation") {
  // STAGE must be defined before this is imported
  const { bucketPrefix, hostname } = require("../deployment.cjs");
  baseUrl = `/${bucketPrefix}/`;
  // Used by index.html for og:image and the Crowdin in-context translation exit URL.
  console.log(`VITE_FULL_URL=https://${hostname}${baseUrl}`);
} else {
  baseUrl = "/";
}

// Two env vars as BASE_URL seems to be blank when running jest even if we set it.
console.log(`BASE_URL=${baseUrl}`);
console.log(`E2E_BASE_URL=${baseUrl}`);
