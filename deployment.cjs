/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const {
  createDeploymentDetailsFromOptions,
} = require("@microbit/website-deploy-s3");

// The buckets and their distributions are defined in
// microbit-foundation/microbit-org (apps/python), which deploys the
// versioner at the root of the staging and production buckets.
const { s3Config } = createDeploymentDetailsFromOptions({
  production: {
    bucket: "python-microbit-org-production",
    hostname: "python.microbit.org",
    mode: "major",
    allowPrerelease: true,
  },
  beta: {
    bucket: "python-microbit-org-production",
    hostname: "python.microbit.org",
    prefix: "v/beta",
  },
  staging: {
    bucket: "python-microbit-org-staging",
    hostname: "stage-python.microbit.org",
    prefix: "v/3",
  },
  review: {
    bucket: "python-microbit-org-review",
    hostname: "review-python.microbit.org",
    mode: "branch-prefix",
  },
});
module.exports = {
  ...s3Config,
  region: "eu-west-1",
  // The buckets are private (BucketOwnerEnforced), so objects take no ACL.
  acl: null,
  findDistribution: true,
  removeNonexistentObjects: true,
  // Open or cached pages may still ask for the previous build's hashed files.
  staleObjectsPatterns: ["assets/**", "workers/**"],
  params: {
    "**/**.html": {
      CacheControl: "public, max-age=0, must-revalidate",
    },
    "**/assets/**": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**/!(sw).js": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**.css": { CacheControl: "public, max-age=31536000, immutable" },
  },
};
