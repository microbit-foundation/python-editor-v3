import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
const resources = {
  en: {
    translation: {
      "Feedback Text":
        "Hi! This is an alpha release of the new micro:bit Python editor.\nWe’ve started by making sure it has all the features from the current editor. Soon we will start adding new features.\nThis means the editor could change rapidly, and sometimes things might break. If you want to use a stable editor please use the main editor.\nHelp us improve by providing your feedback.",
    },
  },
  fr: {
    translation: {
      "Feedback Text":
        "Salut! C'est une version alpha du nouvel éditeur Python micro:bit. Nous avons commencé par nous assurer qu'il possède toutes les fonctionnalités de l'éditeur actuel. Bientôt, nous commencerons à ajouter de nouvelles fonctionnalités. Cela signifie que l'éditeur peut changer rapidement, et parfois les choses peuvent casser. Si vous souhaitez utiliser un éditeur stable, veuillez utiliser l'éditeur principal. Aidez-nous à nous améliorer en nous faisant part de vos commentaires.",
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
