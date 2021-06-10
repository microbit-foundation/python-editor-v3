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
