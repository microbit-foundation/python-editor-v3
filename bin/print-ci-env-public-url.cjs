#!/usr/bin/env node
let baseUrl;
if (process.env.GITHUB_REPOSITORY_OWNER === "microbit-foundation") {
  // STAGE must be defined before this is imported
  const { bucketPrefix, bucketName } = require("../deployment.cjs");
  baseUrl = `/${bucketPrefix}/`;

  const fullUrl = `https://${bucketName}${baseUrl}`;
  // This is used for og:url and similar. Not quite right for review domain but we don't really care.
  console.log(`VITE_FULL_URL=${fullUrl}`);
} else {
  baseUrl = "/";
}

// Two env vars as BASE_URL seems to be blank when running jest even if we set it.
console.log(`BASE_URL=${baseUrl}`);
console.log(`E2E_BASE_URL=${baseUrl}`);
