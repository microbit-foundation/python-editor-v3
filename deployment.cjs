/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const {
  createDeploymentDetailsFromOptions,
} = require("@microbit/website-deploy-s3");

const review = process.env.STAGE === "REVIEW";

const { s3Config } = createDeploymentDetailsFromOptions({
  production: {
    bucket: "python-editor-v3.microbit.org",
    mode: "major",
    allowPrerelease: true,
  },
  staging: {
    bucket: "stage-python-editor-v3.microbit.org",
    prefix: "v/beta",
  },
  review: {
    bucket: "python-microbit-org-review",
    mode: "branch-prefix",
  },
});
module.exports = {
  ...s3Config,
  region: "eu-west-1",
  removeNonexistentObjects: true,
  redirects: [],
  // Review is a private bucket behind CloudFront, defined in
  // microbit-foundation/microbit-org's apps/python. Staging and production
  // are still public website buckets.
  ...(review
    ? {
        acl: null,
        findDistribution: true,
        // Open or cached pages may still ask for the previous build's
        // hashed files.
        staleObjectsPatterns: ["assets/**", "workers/**"],
      }
    : {}),
  params: {
    "**/**.html": {
      CacheControl: "public, max-age=0, must-revalidate",
    },
    "**/assets/**": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**/!(sw).js": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**.css": { CacheControl: "public, max-age=31536000, immutable" },
  },
};
