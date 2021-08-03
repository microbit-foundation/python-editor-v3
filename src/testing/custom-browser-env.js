const Environment = require("jest-environment-jsdom");

/**
 * A custom environment to make TextEncoder/TextDecoder available.
 */
module.exports = class CustomBrowserEnvironment extends Environment {
  async setup() {
    await super.setup();
    if (this.global.TextEncoder) {
      throw new Error("Workaround environment no longer required.");
    }
    const { TextEncoder, TextDecoder } = require("util");
    Object.assign(this.global, { TextEncoder, TextDecoder });
  }
};
