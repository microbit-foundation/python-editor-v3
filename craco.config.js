/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const path = require("path");
const fs = require("fs");

// Support optionally pulling in external branding if the module is installed.
const theme = "@microbit-foundation/python-editor-next-microbit";
const external = `node_modules/${theme}`;
const internal = "src/deployment/default";
const location = fs.existsSync(external) ? theme : internal;

module.exports = {
  webpack: {
    alias: {
      "@deployment": path.resolve(__dirname, location),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@deployment(.*)$": `<rootDir>/${location}$1`,
        "\\.worker": "<rootDir>/src/mocks/worker.js",
      },
    },
  },
};
