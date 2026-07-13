/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/react";
import { ReactNode, createContext } from "react";
import { CookieConsent, DeploymentConfigFactory } from "..";
import { ConsoleLogging } from "./logging";
import theme from "./theme";

const stubConsentValue: CookieConsent = {
  analytics: false,
  functional: true,
};
const stubConsentContext = createContext<CookieConsent | undefined>(
  stubConsentValue
);

const DefaultAppLogo = (props: BoxProps) => (
  <Box
    as="span"
    fontSize="2xl"
    fontWeight="normal"
    lineHeight="normal"
    whiteSpace="nowrap"
    {...props}
  >
    Python Editor
  </Box>
);

const defaultDeploymentFactory: DeploymentConfigFactory = () => ({
  chakraTheme: theme,
  AppLogo: DefaultAppLogo,
  // This isn't ideal as it's the branded version. You can just remove the field to remove the welcome dialog.
  welcomeVideoYouTubeId: "mREwMW69qKc",
  logging: new ConsoleLogging(),
  compliance: {
    ConsentProvider: ({ children }: { children: ReactNode }) => (
      <stubConsentContext.Provider value={stubConsentValue}>
        {children}
      </stubConsentContext.Provider>
    ),
    consentContext: stubConsentContext,
    manageCookies: undefined,
  },
});

export default defaultDeploymentFactory;
