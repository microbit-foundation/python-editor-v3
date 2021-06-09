import { useSettings } from "../settings/settings";
import { IntlProvider, MessageFormatElement } from "react-intl";
import { ReactNode, useEffect, useState } from "react";

async function loadLocaleData(locale: string) {
  switch (locale) {
    case "fr":
      return (await import("./fr.json")).default;
    default:
      return (await import("./fr.json")).default;
  }
}

type Messages = Record<string, string> | Record<string, MessageFormatElement[]>;

interface TranslationProviderProps {
  children: ReactNode;
}

const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [{ languageId }] = useSettings();
  // If the messages are for a different langauge (or missing) then reload them
  const [messages, setMessages] = useState<Messages | undefined>();
  useEffect(() => {
    const load = async () => {
      setMessages(await loadLocaleData(languageId));
    };
    load();
  }, [languageId]);
  return messages ? (
    <IntlProvider locale={languageId} defaultLocale="fr" messages={messages}>
      {children}
    </IntlProvider>
  ) : null;
};

export default TranslationProvider;
