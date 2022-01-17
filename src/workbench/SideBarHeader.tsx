import { Box, Flex, HStack, Link } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";

const SideBarHeader = () => {
  const intl = useIntl();
  const brand = useDeployment();
  return (
    <Flex
      backgroundColor="brand.500"
      boxShadow="0px 4px 16px #00000033"
      zIndex={3}
      height={topBarHeight}
      alignItems="center"
    >
      <Link
        display="block"
        href="https://microbit.org/code/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={intl.formatMessage({ id: "visit-dot-org" })}
      >
        <HStack spacing={3.5} pl={4} pr={4}>
          <Box width="3.56875rem" color="white" role="img">
            {brand.squareLogo}
          </Box>
          <Box width="9.098rem" role="img" color="white">
            {brand.horizontalLogo}
          </Box>
        </HStack>
      </Link>
    </Flex>
  );
};

export default SideBarHeader;
