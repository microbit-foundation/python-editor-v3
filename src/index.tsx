import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { IntlProvider } from "react-intl";

function loadLocaleData(locale: string) {
  switch (locale) {
    case "fr":
      return import("lang/en.json");
    default:
      return import("lang/en.json");
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

bootstrapApplication("en", document.getElementById("root")!);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
