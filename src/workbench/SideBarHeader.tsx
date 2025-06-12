/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Container,
  Fade,
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
import { useCallback, useEffect, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton from "../common/CollapsibleButton";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { useResizeObserverContentRect } from "../common/use-resize-observer";
import { zIndexSidebarHeader } from "../common/zIndex";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import { supportedSearchLanguages } from "../documentation/search/search.worker";
import { useSearch } from "../documentation/search/search-hooks";
import SearchDialog from "../documentation/search/SearchDialog";
import { microbitOrgUrl } from "../external-links";
import { useLogging } from "../logging/logging-hooks";
import { RouterState, useRouterState } from "../router-hooks";
import { useSettings } from "../settings/settings";
import { useHotkeys } from "react-hotkeys-hook";
import {
  globalShortcutConfig,
  keyboardShortcuts,
} from "../common/keyboard-shortcuts";

interface SideBarHeaderProps {
  sidebarShown: boolean;
  onSidebarToggled: () => void;
}

const SideBarHeader = ({
  sidebarShown,
  onSidebarToggled,
}: SideBarHeaderProps) => {
  const intl = useIntl();
  const logging = useLogging();
  const brand = useDeployment();
  const searchModal = useDisclosure();
  const { results, query, setQuery } = useSearch();
  const [, setRouterState] = useRouterState();
  const [viewedResults, setViewedResults] = useState<string[]>([]);
  const collapseBtn = useDisclosure({ defaultIsOpen: true });

  const handleModalOpened = useCallback(() => {
    collapseBtn.onClose();
    searchModal.onOpen();
  }, [collapseBtn, searchModal]);

  const handleModalClosed = useCallback(() => {
    collapseBtn.onOpen();
    searchModal.onClose();
  }, [collapseBtn, searchModal]);

  const handleCollapseBtnClick = useCallback(() => {
    logging.event({
      type: "sidebar-toggle",
      message: !sidebarShown ? "open" : "close",
    });
    onSidebarToggled();
  }, [logging, onSidebarToggled, sidebarShown]);

  const [{ languageId }] = useSettings();
  const searchAvailable = supportedSearchLanguages.includes(languageId);

  const handleSearchShortcut = useCallback(() => {
    if (searchAvailable) {
      handleModalOpened();
      if (!sidebarShown) {
        onSidebarToggled();
      }
    }
  }, [handleModalOpened, onSidebarToggled, searchAvailable, sidebarShown]);

  useHotkeys(
    keyboardShortcuts.search,
    handleSearchShortcut,
    globalShortcutConfig
  );

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        const newQuery = e.currentTarget.value;
        setQuery(newQuery);
      },
      [setQuery]
    );

  const handleClear = useCallback(() => {
    setQuery("");
    setViewedResults([]);
  }, [setQuery]);

  const handleViewResult = useCallback(
    (id: string, navigation: RouterState) => {
      if (!viewedResults.includes(id)) {
        setViewedResults([...viewedResults, id]);
      }
      handleModalClosed();
      // Create new RouterState object to enforce navigation when clicking the same entry twice.
      const routerState: RouterState = JSON.parse(JSON.stringify(navigation));
      setRouterState(routerState, "documentation-search");
    },
    [setViewedResults, viewedResults, setRouterState, handleModalClosed]
  );

  useEffect(() => {
    setViewedResults([]);
  }, [results]);

  const ref = useRef<HTMLDivElement>(null);
  const faceLogoRef = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(ref);
  const contentWidth = contentRect?.width ?? 0;
  const searchButtonMode =
    contentWidth && contentWidth > 405 ? "button" : "icon";
  const paddingX = 14;
  const modalOffset = faceLogoRef.current
    ? faceLogoRef.current.getBoundingClientRect().right + paddingX
    : 0;
  const modalWidth = contentWidth - modalOffset + "px";
  return (
    <>
      {searchAvailable && searchModal.isOpen && (
        <Modal
          isOpen={searchModal.isOpen}
          onClose={handleModalClosed}
          size="lg"
        >
          <ModalOverlay>
            <ModalContent
              mt={3.5}
              ml={modalOffset + "px"}
              width={modalWidth}
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
      )}
      <Container variant="sidebar-header">
        <Flex
          ref={ref}
          boxShadow="0px 4px 16px #00000033"
          zIndex={zIndexSidebarHeader}
          height={
            searchAvailable && searchModal.isOpen ? "4.95rem" : topBarHeight
          }
          alignItems="center"
          justifyContent="space-between"
          pr={4}
          transition="height .2s"
          position="relative"
        >
          <Link
            display="block"
            href={microbitOrgUrl(languageId)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={intl.formatMessage({ id: "visit-dot-org" })}
            mx="1rem"
          >
            <HStack spacing="0.875rem">
              <Box
                width="3.56875rem"
                color="white"
                role="img"
                ref={faceLogoRef}
              >
                {brand.squareLogo}
              </Box>
              {!query && sidebarShown && (
                <Box width="9.098rem" role="img" color="white">
                  {brand.horizontalLogo}
                </Box>
              )}
            </HStack>
          </Link>
          {searchAvailable && !query && sidebarShown && (
            <CollapsibleButton
              onClick={handleModalOpened}
              backgroundColor="brand.700"
              fontWeight="normal"
              color="#fffc"
              icon={<Box as={RiSearch2Line} fontSize="lg" color="fff" />}
              fontSize="sm"
              _hover={{}}
              _active={{}}
              border="unset"
              textAlign="left"
              p={3}
              pr={`min(${contentWidth / 50}%, var(--chakra-space-20))`}
              _collapsed={{
                pr: 3,
              }}
              text={intl.formatMessage({ id: "search" })}
              mode={searchButtonMode}
              mr="2rem"
            />
          )}
          {searchAvailable && query && sidebarShown && (
            <Flex
              backgroundColor="white"
              borderRadius="3xl"
              width={`calc(100% - ${modalOffset}px - 28px)`}
              marginRight="28px"
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
                onClick={handleModalOpened}
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
          <Flex
            height="100%"
            alignItems="center"
            position="absolute"
            width="28px"
            right={sidebarShown ? "-8px" : "-28px"}
          >
            <Fade in={collapseBtn.isOpen} initial={{ opacity: 1 }}>
              <HideSplitViewButton
                aria-label={
                  sidebarShown
                    ? intl.formatMessage({ id: "sidebar-collapse" })
                    : intl.formatMessage({ id: "sidebar-expand" })
                }
                onClick={handleCollapseBtnClick}
                splitViewShown={sidebarShown}
                direction="expandRight"
              />
            </Fade>
          </Flex>
        </Flex>
      </Container>
    </>
  );
};

export default SideBarHeader;
