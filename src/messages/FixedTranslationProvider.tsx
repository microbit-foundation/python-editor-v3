/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import en from "./ui.en.json";

interface FixedTranslationProviderProps {
  children: ReactNode;
}

/**
 * Provides translation support for English only.
 *
 * Suitable for testing of translated units as it avoids async load of messages
 * and the dependency on the settings.
 */
const FixedTranslationProvider = ({
  children,
}: FixedTranslationProviderProps) => {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={en}>
      {children}
    </IntlProvider>
  );
};

export default FixedTranslationProvider;
