/**
 * Crowdin supports a slightly different flavour of JSON to react-intl.
 *
 * This script:
 *
 * 1. Converts lang/ui.en.json to Crowdin's format in crowdin/ui.en.json
 * 2. Converts any Crowdin format crowdin/translated/{code}.json files to lang/{code}.json.
 *
 * For now we add/download files from Crowdin manually.
 */
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const exists = async (destination) => {
  try {
    await fsp.access(destination, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const ensureDirs = async (dirPath) => {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
  }
};

const intlToCrowdin = (string) => {
  const { defaultMessage: message, description } = string;
  return {
    message,
    description,
  };
};

const crowdinToIntl = (string) => {
  const { message: defaultMessage, description } = string;
  return {
    defaultMessage,
    description,
  };
};

const convertFile = async (input, output, conversion) => {
  const strings = await fsp.readFile(input, { encoding: "utf-8" });
  const json = JSON.parse(strings);
  const converted = Object.fromEntries(
    Object.entries(json).map(([k, v]) => {
      return [k, conversion(v)];
    })
  );
  return fsp.writeFile(output, JSON.stringify(converted, null, 2));
};

const main = async () => {
  await ensureDirs("crowdin");
  await convertFile("lang/ui.en.json", "crowdin/ui.en.json", intlToCrowdin);
  const translatedDir = "crowdin/translated";
  if (await exists(translatedDir)) {
    const translatedDirEntries = (await fsp.readdir(translatedDir)).filter(
      (n) => n.endsWith(".json")
    );
    await Promise.all(
      translatedDirEntries.map((translated) =>
        convertFile(
          path.join(translatedDir, translated),
          path.join("lang/", translated),
          crowdinToIntl
        )
      )
    );
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
