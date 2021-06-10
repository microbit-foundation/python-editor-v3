import { ReactNode } from "react";
import { default as d } from "./microbit";
export const deployment = d;

export interface DeploymentConfig {
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  chakraTheme: any;

  supportLink?: string;
  termsOfUseLink?: string;
  translationLink?: string;

  // Do we need the CM theme or can we write it to only use Chakra theme colours?
}

export const useDeployment = (): DeploymentConfig => {
  return deployment;
};
