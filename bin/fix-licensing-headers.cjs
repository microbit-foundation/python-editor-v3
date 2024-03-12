/**
 * Script to add missing licensing headers.
 * Usually run via npm script.
 */
const { promises: fsp } = require("fs");
const path = require("path");

const header = `/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
`;

async function* walk(dir) {
  for await (const d of await fsp.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      yield* walk(entry);
    } else if (d.isFile()) {
      yield entry;
    }
  }
}

async function main() {
  for await (const p of walk("src")) {
    if (/\.tsx?$/.test(p)) {
      const contents = await fsp.readFile(p, { encoding: "utf-8" });
      if (!contents.startsWith("/**")) {
        await fsp.writeFile(p, header + contents);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
