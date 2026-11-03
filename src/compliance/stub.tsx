/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, createContext } from "react";
import { CookieConsent, DeploymentConfig } from "../deployment";

const stubConsentValue: CookieConsent = {
  analytics: false,
  functional: true,
};
const StubConsentContext = createContext<CookieConsent | undefined>(
  stubConsentValue
);

/**
 * Compliance for builds without the shared-assets cookie modal (OSS forks,
 * local dev). Consent is immediately "functional only" so features gated on
 * having a consent decision, such as the welcome dialog, still work.
 */
export const createStubCompliance = (): DeploymentConfig["compliance"] => ({
  ConsentProvider: ({ children }: { children: ReactNode }) => (
    <StubConsentContext value={stubConsentValue}>{children}</StubConsentContext>
  ),
  consentContext: StubConsentContext,
  manageCookies: undefined,
});
