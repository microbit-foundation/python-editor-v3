/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  fallbackLocale,
  inContextTranslationLangId,
  supportedLanguages,
  useSettings,
} from "../settings/settings";
import { IntlProvider, MessageFormatElement } from "react-intl";
import { ReactNode, useEffect, useState } from "react";
import { retryAsyncLoad } from "../common/chunk-util";
import {
  OfflineError,
  showOfflineLanguageToast,
} from "../language-server/error-util";
import { useToast } from "@microbit/ui";

async function loadLocaleData(locale: string): Promise<Messages> {
  // Matched case-insensitively: stored settings and ?l= links predate
  // canonical id casing. The catalog file takes the canonical id. Vite
  // splits the template import into a chunk per catalog.
  const lower = locale.toLowerCase();
  const id =
    lower === inContextTranslationLangId
      ? inContextTranslationLangId
      : supportedLanguages.find((l) => l.id.toLowerCase() === lower)?.id;
  if (!id || id === fallbackLocale) {
    return (await import("./ui.en.json")).default;
  }
  return (await import(`./ui.${id}.json`)).default as Messages;
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
  const toast = useToast();
  // If the messages are for a different language (or missing) then reload them
  const [messages, setMessages] = useState<Messages | undefined>();
  useEffect(() => {
    const load = async () => {
      try {
        setMessages(await retryAsyncLoad(() => loadLocaleData(languageId)));
      } catch (err) {
        if (err instanceof OfflineError) {
          showOfflineLanguageToast(toast);
          setMessages(await loadLocaleData(fallbackLocale));
        } else {
          throw err;
        }
      }
    };
    load();
  }, [languageId, toast]);
  return messages ? (
    <IntlProvider locale={languageId} defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  ) : null;
};

export default TranslationProvider;
