#!/usr/bin/env node
const ref = process.env.GITHUB_REF;
let stage;
if (ref === "refs/heads/main") {
  stage = "STAGING";
} else if (ref.startsWith("refs/tags/v")) {
  stage = "PRODUCTION";
} else {
  stage = "REVIEW";
}

console.log(`STAGE=${stage}`);
console.log(`VITE_STAGE=${stage}`);
