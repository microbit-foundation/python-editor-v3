import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
const resources = async () => {
  return {
    en: {
      translation: await import("./lang/en.json").default,
    },
    fr: {
      translation: import("./lang/fr.json").default,
    },
  };
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "fr", // language to use
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
