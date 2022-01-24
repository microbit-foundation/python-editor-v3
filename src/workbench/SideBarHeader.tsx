import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import Search from "../documentation/Search";
import { SearchResults, useSearch } from "../documentation/search-hooks";
import { flags } from "../flags";

const SideBarHeader = () => {
  const ref = useRef<HTMLDivElement>(null);
  const faceLogoRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const brand = useDeployment();
  const searchModal = useDisclosure();
  const search = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | undefined>();
  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        const newQuery = e.currentTarget.value;
        setQuery(newQuery);
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          setResults(search.search(trimmedQuery));
        } else {
          setResults(undefined);
        }
      },
      [search]
    );
  const handleClear = useCallback(() => {
    setQuery("");
    setResults(undefined);
    if (ref.current) {
      ref.current.focus();
    }
  }, [setQuery, setResults]);
  // Width of the sidebar tabs. Perhaps we can restructure the DOM?
  const sidebarWidth = useRef<HTMLDivElement>(null);
  const offset = faceLogoRef.current
    ? faceLogoRef.current.getBoundingClientRect().right + 14
    : 0;
  const width = sidebarWidth.current
    ? sidebarWidth.current!.clientWidth - offset - 14 + "px"
    : undefined;

  return (
    <>
      {/* Empty box used to calculate width only. */}
      <Box ref={sidebarWidth}></Box>
      {flags.search && (
        <Modal
          isOpen={searchModal.isOpen}
          onClose={searchModal.onClose}
          size="lg"
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
              maxHeight="unset"
            >
              <ModalBody p={0}>
                <Search
                  onClose={searchModal.onClose}
                  results={results}
                  setResults={setResults}
                  query={query}
                  setQuery={setQuery}
                  onQueryChange={handleQueryChange}
                  onHandleClear={handleClear}
                />
              </ModalBody>
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
            <Box width="3.56875rem" color="white" role="img" ref={faceLogoRef}>
              {brand.squareLogo}
            </Box>
            {!query && (
              <Box width="9.098rem" role="img" color="white">
                {brand.horizontalLogo}
              </Box>
            )}
          </HStack>
        </Link>
        {flags.search && !query && (
          <Button
            onClick={searchModal.onOpen}
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
        {flags.search && query && (
          <ButtonGroup
            isAttached
            backgroundColor="white"
            width="full"
            borderRadius="3xl"
          >
            <Button
              _active={{}}
              _hover={{}}
              border="unset"
              color="#gray.800"
              flex={1}
              fontSize="md"
              fontWeight="normal"
              justifyContent="flex-start"
              leftIcon={<Box as={RiSearch2Line} fontSize="lg" />}
              onClick={searchModal.onOpen}
            >
              {query}
            </Button>
            <IconButton
              aria-label="Clear"
              backgroundColor="white"
              // Also used for Zoom, move to theme.
              color="#838383"
              fontSize="2xl"
              icon={<RiCloseLine />}
              isRound={false}
              onClick={handleClear}
              pl={3}
              pr={3}
              variant="ghost"
            />
          </ButtonGroup>
        )}
      </Flex>
    </>
  );
};

export default SideBarHeader;
