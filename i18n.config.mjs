import { defineConfig } from "@microbit/i18n-tools";

// Languages with an editor UI translation in Crowdin. Which of them the app
// offers, and whether as a preview, is decided in src/settings/settings.tsx;
// a new language also needs TranslationProvider.tsx, lunr search support,
// the stubs repo and the pyright fork (see docs/tech-overview.md).
const languages = [
  "ca",
  "de",
  "es-ES",
  "fr",
  "ga-IE",
  "ja",
  "ko",
  "nl",
  "pl",
  "zh-CN",
  "zh-TW",
  "lol",
];

export default defineConfig({
  crowdin: {
    project: "microbitorg",
    branch: "new",
    directory: "apps/python-editor-v3",
  },
  languages,
  catalogs: [
    {
      source: "lang/ui.en.json",
      out: "src/messages/ui.{lang}.json",
      packages: ["@microbit/ui", "@microbit/ui-patterns"],
    },
  ],
});
