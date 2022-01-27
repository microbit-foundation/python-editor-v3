/**
 * Used by the CI build to output the bucket prefix to use as the
 * PUBLIC_URL environement variable.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const {
  createDeploymentDetailsWithReviewPrefixes,
} = require("@microbit-foundation/website-deploy-aws-config");

const {
  s3Config: { bucketPrefix },
} = createDeploymentDetailsWithReviewPrefixes();
console.log(`/${bucketPrefix}/`);
