/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Compiles lang/ui.<locale>.json into the formatjs AST catalogs in
 * src/messages/, merging in the source catalogs shipped by packages
 * (currently @microbit/ui) so their strings ride in the app's lazily
 * loaded per-locale chunks rather than being bundled eagerly for every
 * locale. Package message ids are namespaced (`ui.`), so a collision with
 * an app id fails the compile.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const formatjs = require.resolve("@formatjs/cli/bin/formatjs");
const packageLangDirs = ["@microbit/ui"].map((name) => ({
  name,
  dir: path.dirname(require.resolve(`${name}/lang/ui.en.json`)),
}));

for (const file of fs.readdirSync(path.join(root, "lang")).sort()) {
  const inputs = [path.join(root, "lang", file)];
  for (const { name, dir } of packageLangDirs) {
    const packageFile = path.join(dir, file);
    if (fs.existsSync(packageFile)) {
      inputs.push(packageFile);
    } else {
      console.warn(`${name} has no ${file}; its English text will be used`);
    }
  }
  execFileSync(
    process.execPath,
    [
      formatjs,
      "compile",
      ...inputs,
      "--ast",
      "--out-file",
      path.join(root, "src", "messages", file),
    ],
    { stdio: "inherit" }
  );
}
