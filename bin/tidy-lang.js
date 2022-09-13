/**
 * Sorts the strings in the lang/*.json source files so we
 * don't have to care about where we add new strings.
 */
const fs = require("fs");
const path = require("path");

const en = JSON.parse(fs.readFileSync("lang/ui.en.json"));
const validKeys = new Set(Object.keys(en));

const variableRegExp = /({[a-zA-Z0-9]+})/g;

// This is just a best effort check that variables haven't been changed.
const areTranslationsValid = (file, enJson, translatedJson) => {
  let valid = true;
  const keys = Object.keys(en);
  for (const k of keys) {
    const en = enJson[k].defaultMessage;
    const translated = translatedJson[k].defaultMessage;
    if (en.match(/, plural/)) {
      // Skip ICU strings as we don't understand them.
      continue;
    }
    const variablesEn = new Set(en.match(variableRegExp) ?? []);
    const variablesTranslated = new Set(translated.match(variableRegExp) ?? []);
    const areSetsEqual = (a, b) =>
      a.size === b.size && Array.from(a).every((value) => b.has(value));
    if (!areSetsEqual(variablesEn, variablesTranslated)) {
      if (valid) {
        console.error(file);
        valid = false;
      }
      console.error(`  ${en}`);
      console.error(`  ${translated}`);
      console.error(`  Differing variables!`);
      console.error();
    }
  }
  return valid;
};

const valid = fs
  .readdirSync("lang")
  .filter((f) => f.endsWith(".json"))
  .map((messages) => {
    const file = path.join("lang", messages);
    const data = {
      // Ensure we fallback to English even if we haven't roundtripped via Crowdin yet.
      ...en,
      ...JSON.parse(fs.readFileSync(file)),
    };
    Object.keys(data).forEach((k) => {
      if (!validKeys.has(k)) {
        delete data[k];
      }
    });
    const sortedKeys = Object.keys(data).sort();
    const result = Object.create(null);
    sortedKeys.forEach((k) => (result[k] = data[k]));
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
    return areTranslationsValid(file, en, result);
  })
  .reduce((prev, curr) => prev && curr, true);
process.exit(valid ? 0 : 2);
