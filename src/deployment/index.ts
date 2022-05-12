/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import { Logging } from "../logging/logging";

// This is configured via a webpack alias, defaulting to ./default
import { default as d } from "theme-package";
export const deployment: DeploymentConfig = d;

export interface DeploymentConfig {
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  chakraTheme: any;

  supportLink?: string;
  guideLink?: string;
  termsOfUseLink?: string;
  translationLink?: string;

  logging: Logging;
}

export const useDeployment = (): DeploymentConfig => {
  return deployment;
};
