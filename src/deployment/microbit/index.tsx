import { DeploymentConfig } from "..";
import Logo from "./Logo";
import LogoFace from "./LogoFace";
import theme from "./theme";

const microbitDeployment: DeploymentConfig = {
  squareLogo: <LogoFace fill="white" />,
  horizontalLogo: <Logo />,
  chakraTheme: theme,

  supportLink: "https://support.microbit.org/support/home",
  termsOfUseLink: "https://microbit.org/terms-of-use/",
  // Example only, needs updating to docs specific to this editor.
  translationLink:
    "https://support.microbit.org/support/solutions/articles/19000106022-translating-the-micro-bit-python-editor",
};

export default microbitDeployment;
