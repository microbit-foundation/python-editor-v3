#!/usr/bin/env node
// STAGE must be defined before this is imported
const { bucketPrefix } = require("../deployment");

// Two env vars as PUBLIC_URL seems to be blank when running jest even if we set it.
console.log(`PUBLIC_URL=/${bucketPrefix}/`);
console.log(`E2E_PUBLIC_URL=/${bucketPrefix}/`);
