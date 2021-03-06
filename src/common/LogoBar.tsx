import { Image, Flex } from "@chakra-ui/react";
import Logo from "./Logo";
import pythonLogo from "./pythonLogo.png";

/**
 * Logo bar for branding.
 */
const LogoBar = () => {
  return (
    <Flex
      fill="white"
      backgroundColor="blackAlpha.900"
      alignItems="center"
      justifyContent="space-between"
      padding={3}
    >
      <Logo height="30px" />
      <Image src={pythonLogo} alt="Python" width={8} height={8} />
    </Flex>
  );
};

export default LogoBar;
