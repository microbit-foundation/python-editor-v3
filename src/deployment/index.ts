import { ReactNode } from "react";
import { Logging } from "../logging/logging";

// This is configured via a webpack alias, defaulting to ./default
import { default as d } from "@deployment";
export const deployment = d;

export interface DeploymentConfig {
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  chakraTheme: any;

  supportLink?: string;
  termsOfUseLink?: string;
  translationLink?: string;

  logging: Logging;
}

export const useDeployment = (): DeploymentConfig => {
  return deployment;
};
