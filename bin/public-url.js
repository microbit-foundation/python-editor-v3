/**
 * Used by the CI build to output the bucket prefix to use as the
 * PUBLIC_URL environement variable.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const  { bucketPrefix } = require("../deployment");
console.log(`/${bucketPrefix}/`);
