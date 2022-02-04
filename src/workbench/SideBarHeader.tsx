/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
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
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import useIsUnmounted from "../common/use-is-unmounted";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import { SearchResults } from "../documentation/search/common";
import { useSearch } from "../documentation/search/search-hooks";
import SearchDialog from "../documentation/search/SearchDialog";
import { useLogging } from "../logging/logging-hooks";
import { RouterState, useRouterState } from "../router-hooks";

const SideBarHeader = () => {
  const ref = useRef<HTMLDivElement>(null);
  const faceLogoRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const brand = useDeployment();
  const searchModal = useDisclosure();
  const search = useSearch();
  const [query, setQuery] = useState("");
  const [, setRouterState] = useRouterState();
  const [results, setResults] = useState<SearchResults | undefined>();
  const isUnmounted = useIsUnmounted();
  const [viewedResults, setViewedResults] = useState<string[]>([]);
  const logging = useLogging();

  // When we add more keyboard shortcuts, we should pull this up and have a CM-like model of the
  // available actions and their shortcuts, with a hook used here to register a handler for the action.
  useEffect(() => {
    const isMac = /Mac/.test(navigator.platform);
    const keydown = (e: KeyboardEvent) => {
      if (
        (e.key === "F" || e.key === "f") &&
        (isMac ? e.metaKey : e.ctrlKey) &&
        e.shiftKey &&
        !e.repeat
      ) {
        searchModal.onOpen();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
    };
  }, [searchModal]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (newQuery: string) => {
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          const results = await search.search(trimmedQuery);
          if (!isUnmounted()) {
            setResults((prevResults) => {
              if (!prevResults) {
                logging.event({ type: "search" });
              }
              return results;
            });
          }
        } else {
          setResults(undefined);
        }
        setViewedResults([]);
      }, 300),
    [search, setResults, setViewedResults, isUnmounted, logging]
  );

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        const newQuery = e.currentTarget.value;
        setQuery(newQuery);
        debouncedSearch(newQuery);
      },
      [debouncedSearch, setQuery]
    );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults(undefined);
    setViewedResults([]);
  }, [setQuery, setResults]);

  const handleViewResult = useCallback(
    (id: string, navigation: RouterState) => {
      if (!viewedResults.includes(id)) {
        setViewedResults([...viewedResults, id]);
      }
      searchModal.onClose();
      // Create new RouterState object to enforce navigation when clicking the same entry twice.
      const routerState: RouterState = JSON.parse(JSON.stringify(navigation));
      setRouterState(routerState, "toolkit-search");
    },
    [setViewedResults, viewedResults, searchModal, setRouterState]
  );
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
              <SearchDialog
                results={results}
                query={query}
                onQueryChange={handleQueryChange}
                onClear={handleClear}
                viewedResults={viewedResults}
                onViewResult={handleViewResult}
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      </Modal>
      <Flex
        ref={ref}
        backgroundColor="brand.500"
        boxShadow="0px 4px 16px #00000033"
        zIndex={3}
        height={searchModal.isOpen ? "5.5rem" : topBarHeight}
        alignItems="center"
        justifyContent="space-between"
        pr={4}
        transition="height .2s"
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
        {!query && (
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
            {intl.formatMessage({ id: "search" })}
          </Button>
        )}
        {query && (
          <Flex
            backgroundColor="white"
            borderRadius="3xl"
            width={`calc(100% - ${offset}px)`}
            position="relative"
          >
            <Button
              _active={{}}
              _hover={{}}
              border="unset"
              color="gray.800"
              flex={1}
              fontSize="md"
              fontWeight="normal"
              justifyContent="flex-start"
              leftIcon={
                <Box as={RiSearch2Line} fontSize="lg" color="#838383" />
              }
              onClick={searchModal.onOpen}
              overflow="hidden"
            >
              {query}
            </Button>
            <IconButton
              aria-label={intl.formatMessage({ id: "clear" })}
              backgroundColor="white"
              // Also used for Zoom, move to theme.
              color="#838383"
              fontSize="2xl"
              icon={<RiCloseLine />}
              isRound={false}
              onClick={handleClear}
              position="absolute"
              right="0"
              pr={3}
              pl={3}
              variant="ghost"
            />
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default SideBarHeader;
