/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const {
  createDeploymentDetailsWithReviewPrefixes,
} = require("@microbit-foundation/website-deploy-aws-config");

const { s3Config } = createDeploymentDetailsWithReviewPrefixes();
module.exports = {
  ...s3Config,
  region: "eu-west-1",
  removeNonexistentObjects: true,
  enableS3StaticWebsiteHosting: true,
  errorDocumentKey: "index.html",
  redirects: [],
  params: {
    "**/**.html": {
      CacheControl: "public, max-age=0, must-revalidate",
    },
    "static/**": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**/!(sw).js": { CacheControl: "public, max-age=31536000, immutable" },
    "**/**.css": { CacheControl: "public, max-age=31536000, immutable" },
  },
};
