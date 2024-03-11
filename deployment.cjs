/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const {
  createDeploymentDetailsFromOptions,
} = require("@microbit-foundation/website-deploy-aws-config");

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
    bucket: "review-python-editor-v3.microbit.org",
    mode: "branch-prefix",
  },
});
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
