#!/usr/bin/env node
const { bucketPrefix } = require("../deployment");
const ref = process.env.GITHUB_REF;
const eventName = process.env.GITHUB_EVENT_NAME;

let stage = "";
if (ref === "refs/heads/main") {
  if (eventName === "release") {
    stage = "PRODUCTION";
  } else {
    stage = "STAGING";
  }
} else {
  stage = "REVIEW";
}

console.log(`STAGE=${stage}`);
console.log(`REACT_APP_STAGE=${stage}`);
// Two env vars as PUBLIC_URL seems to be blank when running jest even if we set it.
console.log(`PUBLIC_URL=/${bucketPrefix}/`);
console.log(`E2E_PUBLIC_URL=/${bucketPrefix}/`);
