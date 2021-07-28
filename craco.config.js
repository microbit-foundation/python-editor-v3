/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const path = require("path");
const fs = require("fs");

// Support optionally pulling in external branding if the module is installed.
const external =
  "node_modules/@microbit-foundation/python-editor-next-microbit";
const internal = "src/deployment/default";
const location = fs.existsSync(external) ? external : internal;

module.exports = {
  webpack: {
    alias: {
      "@deployment": path.resolve(__dirname, location),
      "tigerpython-parser": path.resolve(
        __dirname,
        "src/third-party/tigerpython-parser.js"
      ),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@deployment(.*)$": `<rootDir>/${location}$1`,
      },
    },
  },
};
