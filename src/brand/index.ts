import { ReactNode } from "react";
import brand from "./default";

export interface Brand {
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  chakraTheme: any;

  // Do we need the CM theme or can we write it to only use Chakra colours?
}

export const useBrand = (): Brand => {
  return brand;
};
