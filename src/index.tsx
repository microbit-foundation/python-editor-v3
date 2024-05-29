/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { registerSW } from "virtual:pwa-register";
import { flags } from "./flags";
import { baseUrl } from "./base";

if (flags.pwa) {
  registerSW({
    immediate: true,
    // Cache runtime resources on first load.
    // See https://github.com/GoogleChromeLabs/pwa-wp/issues/180.
    onRegisteredSW(_, registration) {
      // Inject webmanifest.
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = `${baseUrl}manifest.webmanifest`;
      document.head.appendChild(link);

      if (registration) {
        registration.onupdatefound = function () {
          const installingWorker = registration?.installing;
          if (installingWorker) {
            installingWorker.onstatechange = function () {
              if (
                installingWorker.state === "activated" &&
                navigator.serviceWorker.controller
              ) {
                const urlsToCache = [
                  location.href,
                  ...performance
                    .getEntriesByType("resource")
                    .map((r) => r.name),
                ];
                installingWorker.postMessage({
                  type: "CACHE_URLS",
                  payload: { urlsToCache },
                });
              }
            };
          }
        };
      }
    },
  });
} else {
  // Clean up if we've disabled the flag
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.unregister().then(() => {
        window.location.reload();
      });
    });
  }
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
