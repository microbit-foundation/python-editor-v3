#!/usr/bin/env node
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
