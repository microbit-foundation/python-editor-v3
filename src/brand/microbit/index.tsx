import { Brand } from "..";
import Logo from "./Logo";
import LogoFace from "./LogoFace";
import theme from "./theme";

const microbitBrand: Brand = {
  squareLogo: <LogoFace fill="white" />,
  horizontalLogo: <Logo />,
  chakraTheme: theme,
};

export default microbitBrand;
