import { Flex, HStack, VStack } from "@chakra-ui/react";
import HelpMenu from "../project/HelpMenu";
import Logo from "../common/Logo";
import OpenButton from "../project/OpenButton";
import ProjectNameEditable from "../project/ProjectNameEditable";
import ShareButton from "../project/ShareButton";

/**
 * The header area with associated actions.
 *
 * This is currently unused but kept around while we're exploring different designs.
 */
const Header = () => {
  const size = "md";
  return (
    <VStack
      spacing={0}
      align="start"
      alignContent="space-between"
      flex="0 0 auto"
    >
      <Flex width="100%" justifyContent="space-between" padding={2}>
        <HStack spacing={5} marginRight={8}>
          <Logo height="28px" />
          <HStack spacing={3}>
            <ProjectNameEditable />
            <ShareButton size={size} />
          </HStack>
        </HStack>
        <HStack spacing={3} as="nav">
          <OpenButton mode="button" size={size} />
          <HelpMenu size={size} />
        </HStack>
      </Flex>
    </VStack>
  );
};

export default Header;
