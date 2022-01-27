/**
 * Sorts the strings in the lang/*.json source files so we
 * don't have to care about where we add new strings.
 */
const fs = require("fs");
const path = require("path");

const en = JSON.parse(fs.readFileSync("lang/en.json"));

fs.readdirSync("lang")
  .filter((f) => f.endsWith(".json"))
  .forEach((messages) => {
    const file = path.join("lang", messages);
    const data = {
      // Ensure we fallback to English even if we haven't roundtripped via Crowdin yet.
      ...en,
      ...JSON.parse(fs.readFileSync(file)),
    };
    const sortedKeys = Object.keys(data).sort();
    const result = Object.create(null);
    sortedKeys.forEach((k) => (result[k] = data[k]));
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
  });
