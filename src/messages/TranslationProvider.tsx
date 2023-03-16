/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useSettings } from "../settings/settings";
import { IntlProvider, MessageFormatElement } from "react-intl";
import { ReactNode, useEffect, useState } from "react";
import { retryAsyncLoad } from "../common/chunk-util";

async function loadLocaleData(locale: string) {
  switch (locale) {
    // Add further cases explicitly for code splitting.
    // The need for this might be worth revisiting.
    case "ca":
      return (await import("./ui.ca.json")).default;
    case "fr":
      return (await import("./ui.fr.json")).default;
    case "es-es":
      return (await import("./ui.es-es.json")).default;
    case "ja":
      return (await import("./ui.ja.json")).default;
    case "ko":
      return (await import("./ui.ko.json")).default;
    case "nl":
      return (await import("./ui.nl.json")).default;
    case "zh-cn":
      return (await import("./ui.zh-cn.json")).default;
    case "zh-tw":
      return (await import("./ui.zh-tw.json")).default;
    default:
      return (await import("./ui.en.json")).default;
  }
}

type Messages = Record<string, string> | Record<string, MessageFormatElement[]>;

interface TranslationProviderProps {
  children: ReactNode;
}

/**
 * Provides translation support to the app via react-intl.
 */
const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [{ languageId }] = useSettings();
  // If the messages are for a different language (or missing) then reload them
  const [messages, setMessages] = useState<Messages | undefined>();
  useEffect(() => {
    const load = async () => {
      setMessages(await retryAsyncLoad(() => loadLocaleData(languageId)));
    };
    load();
  }, [languageId]);
  return messages ? (
    <IntlProvider locale={languageId} defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  ) : null;
};

export default TranslationProvider;
