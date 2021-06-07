import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { IntlProvider } from "react-intl";

async function loadLocaleData(locale: string) {
  switch (locale) {
    case "fr":
      return (await import("./compiled-lang/fr.json")).default;
    default:
      return (await import("./compiled-lang/en.json")).default;
  }
}

const bootstrapApplication = async (locale: string, root: HTMLElement) => {
  const messages = await loadLocaleData(locale);
  ReactDOM.render(
    <React.StrictMode>
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <App />
      </IntlProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

bootstrapApplication("fr", document.getElementById("root")!);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
