import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import Search from "../documentation/Search";
import { flags } from "../flags";

const SideBarHeader = () => {
  const ref = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const brand = useDeployment();
  const search = useDisclosure();
  // Width of the sidebar tabs. Perhaps we can restructure the DOM?
  const offset = 86;
  const width = ref.current
    ? ref.current!.clientWidth - offset - 24 + "px"
    : undefined;
  return (
    <>
      {flags.search && (
        <Modal
          isOpen={search.isOpen}
          onClose={search.onClose}
          size="lg"
          scrollBehavior="inside"
        >
          <ModalOverlay>
            <ModalContent
              mt={3.5}
              ml={offset + "px"}
              width={width}
              containerProps={{
                justifyContent: "flex-start",
              }}
              p={1}
              borderRadius="20px"
              maxWidth="unset"
            >
              <Search />
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
      <Flex
        ref={ref}
        backgroundColor="brand.500"
        boxShadow="0px 4px 16px #00000033"
        zIndex={3}
        height={topBarHeight}
        alignItems="center"
        justifyContent="space-between"
        pr={4}
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
        {flags.search && (
          <Button
            onClick={search.onOpen}
            backgroundColor="#5c40a6"
            fontWeight="normal"
            color="#fffc"
            leftIcon={<Box as={RiSearch2Line} fontSize="lg" color="fff" />}
            fontSize="sm"
            _hover={{}}
            _active={{}}
            border="unset"
            textAlign="left"
            pl={3}
            pr={20}
          >
            Search
          </Button>
        )}
      </Flex>
    </>
  );
};

export default SideBarHeader;
