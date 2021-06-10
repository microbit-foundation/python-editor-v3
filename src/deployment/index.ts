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
}

export const useDeployment = (): DeploymentConfig => {
  return deployment;
};
