import { BoxProps, HStack } from "@chakra-ui/react";
import Logo from "./Logo";

/**
 * Logo bar for branding.
 */
const LogoBar = (props: BoxProps) => {
  return (
    <HStack
      height="4rem"
      alignItems="center"
      justifyContent="center"
      p={2}
      {...props}
    >
      <Logo width="80%" style={{ maxWidth: "150px" }} />
    </HStack>
  );
};

export default LogoBar;
