#!/usr/bin/env node
let baseUrl;
if (process.env.GITHUB_REPOSITORY_OWNER === "microbit-foundation") {
  // STAGE must be defined before this is imported
  const { bucketPrefix, bucketName } = require("../deployment.cjs");
  baseUrl = `/${bucketPrefix}/`;

  // Production and staging are served from python.microbit.org rather than
  // their bucket domains. Review builds are only reachable via the bucket.
  const host =
    process.env.STAGE === "REVIEW" ? bucketName : "python.microbit.org";
  const fullUrl = `https://${host}${baseUrl}`;
  // Used by index.html for og:image and the Crowdin in-context translation exit URL.
  console.log(`VITE_FULL_URL=${fullUrl}`);
} else {
  baseUrl = "/";
}

// Two env vars as BASE_URL seems to be blank when running jest even if we set it.
console.log(`BASE_URL=${baseUrl}`);
console.log(`E2E_BASE_URL=${baseUrl}`);
