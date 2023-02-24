#!/usr/bin/env node
let url;
if (process.env.GITHUB_REPOSITORY_OWNER === "microbit-foundation") {
  // STAGE must be defined before this is imported
  const { bucketPrefix } = require("../deployment");
  url = `/${bucketPrefix}/`;
} else {
  url = "/";
}
// Two env vars as PUBLIC_URL seems to be blank when running jest even if we set it.
console.log(`PUBLIC_URL=${url}`);
console.log(`E2E_PUBLIC_URL=${url}`);
