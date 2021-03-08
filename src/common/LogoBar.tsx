import { Image, HStack } from "@chakra-ui/react";
import Logo from "./Logo";
import pythonLogo from "./pythonLogo.png";

/**
 * Logo bar for branding.
 */
const LogoBar = () => {
  return (
    <HStack
      fill="white"
      backgroundColor="blackAlpha.900"
      alignItems="center"
      justifyContent="space-between"
      padding={3}
      spacing={3}
    >
      <Logo height="30px" />
      <Image src={pythonLogo} alt="Python" width={8} height={8} />
    </HStack>
  );
};

export default LogoBar;
