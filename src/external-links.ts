const microbitOrgSupportedLangs = [
  "ar",
  "ca",
  "cy",
  "es-es",
  "fr",
  "hr",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt-br",
  "pt-pt",
  "sr",
  "zh-cn",
  "zh-tw",
];

const langPath = (languageId: string) => {
  const lang = languageId.toLowerCase();
  return microbitOrgSupportedLangs.includes(lang) ? `${lang}/` : "";
};

export const microbitOrgUrl = (languageId: string) =>
  `https://microbit.org/${langPath(languageId)}`;

export const microbitOrgMiciProjectsUrl = (languageId: string) =>
  `https://microbit.org/${langPath(
    languageId
  )}projects/make-it-code-it/?filters=python`;
