/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext } from "react";
import { createStubCompliance } from "../compliance/stub";
import { createWebCompliance } from "../compliance/web";
import { Logger } from "../logging/logger";
import { Logging } from "../logging/logging";
import { WebSink } from "../logging/sink";

// This is configured via a vite alias, defaulting to ./default
import { default as df } from "theme-package";

/**
 * Brand-and-content config supplied by the (optionally private) theme
 * package. No analytics opinions live here — the OSS deployment loader
 * picks the logger and compliance backend based on build config and env.
 */
export interface BrandConfig {
  /**
   * Stable analytics identifier slug for this product. Attached as
   * the `product` param on every event the logger emits, so dashboards
   * can split traffic by product when multiple sibling apps share a
   * GA4 property.
   */
  product: string;
  welcomeVideoYouTubeId?: string;
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  supportLink?: string;
  guideLink?: string;
  userGuideLink?: string;
  accessibilityLink?: string;
  termsOfUseLink?: string;
  privacyPolicyLink?: string;
  translationLink?: string;
}

export type BrandConfigFactory = (env: Record<string, string>) => BrandConfig;

export interface CookieConsent {
  analytics: boolean;
  functional: boolean;
}

export interface DeploymentConfig extends BrandConfig {
  compliance: {
    /**
     * A provider that will be used to wrap the app UI.
     */
    ConsentProvider: (props: { children: ReactNode }) => JSX.Element;
    /**
     * Context that will be used to read the current consent value.
     * The provider is not used directly.
     */
    consentContext: React.Context<CookieConsent | undefined>;
    /**
     * Optional hook for the user to revisit cookie settings.
     */
    manageCookies: (() => void) | undefined;
  };
  logging: Logging;
}

const brandFactory: BrandConfigFactory = df;

const createLogging = (env: Record<string, string>, product: string): Logging =>
  // WebSink is silent without gtag and Logger falls back to console
  // breadcrumbs without a Sentry DSN, so this is safe for every build.
  new Logger(new WebSink(), env, product);

const createCompliance = (
  env: Record<string, string>
): DeploymentConfig["compliance"] =>
  // The same flag index.html uses to decide whether to load the
  // shared-assets script that provides the cookie modal (and gtag).
  env.VITE_FOUNDATION_BUILD === "true"
    ? createWebCompliance(env)
    : createStubCompliance();

export const deployment: DeploymentConfig = (() => {
  const env = import.meta.env as unknown as Record<string, string>;
  const brand = brandFactory(env);
  return {
    ...brand,
    logging: createLogging(env, brand.product),
    compliance: createCompliance(env),
  };
})();

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- hook-shaped by design and used as one throughout
export const useDeployment = (): DeploymentConfig => deployment;

export const useCookieConsent = (): CookieConsent | undefined => {
  const { compliance } = useDeployment();
  return useContext(compliance.consentContext);
};
