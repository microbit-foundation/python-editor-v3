/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  darkSurface,
  Button,
  Fade,
  Icon,
  IconButton,
  Link,
  Modal,
  ModalBody,
} from "@microbit/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { Box, Flex, HStack, styled } from "styled-system/jsx";
import CollapsibleButton from "../common/CollapsibleButton";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { useResizeObserverContentRect } from "../common/use-resize-observer";
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
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { results, query, setQuery } = useSearch();
  const [, setRouterState] = useRouterState();
  const [viewedResults, setViewedResults] = useState<string[]>([]);
  const [collapseBtnShown, setCollapseBtnShown] = useState(true);

  const handleModalOpened = useCallback(() => {
    setCollapseBtnShown(false);
    setSearchModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setCollapseBtnShown(true);
    setSearchModalOpen(false);
  }, []);

  const handleCollapseBtnClick = useCallback(() => {
    logging.event({
      type: "sidebar_toggle",
      detail: { action: !sidebarShown ? "open" : "close" },
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
      setRouterState(routerState, "search");
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
      {searchAvailable && searchModalOpen && (
        <Modal
          isOpen={searchModalOpen}
          onClose={handleModalClosed}
          size="lg"
          aria-label={intl.formatMessage({ id: "search" })}
          overlayCss={{ justifyContent: "flex-start" }}
          contentCss={{
            mt: "3.5",
            p: "1",
            borderRadius: "20px",
            maxWidth: "unset",
            maxHeight: "unset",
          }}
          // Aligned to the measured logo position at runtime.
          contentStyle={{
            marginLeft: modalOffset + "px",
            width: modalWidth,
          }}
        >
          <ModalBody css={{ p: "0" }}>
            <SearchDialog
              results={results}
              query={query}
              onQueryChange={handleQueryChange}
              onClear={handleClear}
              viewedResults={viewedResults}
              onViewResult={handleViewResult}
            />
          </ModalBody>
        </Modal>
      )}
      <styled.div bg="sidebarHeaderBg" {...darkSurface}>
        <Flex
          ref={ref}
          boxShadow="0px 4px 16px #00000033"
          zIndex="sidebarHeader"
          alignItems="center"
          justifyContent="space-between"
          pr="4"
          transition="height .2s"
          position="relative"
          // topBarHeight is an imported constant; not statically extractable.
          style={{
            height:
              searchAvailable && searchModalOpen ? "4.95rem" : topBarHeight,
          }}
        >
          <Link
            display="block"
            href={microbitOrgUrl(languageId)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={intl.formatMessage({ id: "visit-dot-org" })}
            mx="1rem"
          >
            <HStack gap="0.875rem">
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
              onPress={handleModalOpened}
              icon={<Icon as={RiSearch2Line} css={{ fontSize: "lg" }} />}
              css={{
                backgroundColor: "brand.700",
                fontWeight: "normal",
                color: "#fffc",
                fontSize: "sm",
                // Neutralise the default (outline) variant's chrome with
                // border/_hover/_active resets.
                border: "unset",
                _hover: { color: "#fffc", background: "brand.700" },
                _active: { color: "#fffc", background: "brand.700" },
                textAlign: "left",
                p: "3",
                mr: "2rem",
              }}
              // Width-derived padding is a runtime value Panda can't extract;
              // icon (collapsed) mode keeps the css p="3" instead.
              style={
                searchButtonMode === "button"
                  ? { paddingRight: `min(${contentWidth / 50}%, 5rem)` }
                  : undefined
              }
              text={intl.formatMessage({ id: "search" })}
              mode={searchButtonMode}
            />
          )}
          {searchAvailable && query && sidebarShown && (
            <Flex
              backgroundColor="white"
              borderRadius="3xl"
              marginRight="28px"
              position="relative"
              // Runtime width from the measured logo offset.
              style={{ width: `calc(100% - ${modalOffset}px - 28px)` }}
            >
              <Button
                css={{
                  border: "unset",
                  color: "gray.800",
                  flex: 1,
                  fontSize: "md",
                  fontWeight: "normal",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  // Neutralise the default (outline) variant's hover/active.
                  _hover: { color: "gray.800", background: "white" },
                  _active: { color: "gray.800", background: "white" },
                }}
                startIcon={
                  <Icon
                    as={RiSearch2Line}
                    css={{ fontSize: "lg", color: "#838383" }}
                  />
                }
                onPress={handleModalOpened}
              >
                {query}
              </Button>
              <IconButton
                aria-label={intl.formatMessage({ id: "clear" })}
                css={{
                  // Also used for Zoom, move to theme.
                  color: "#838383",
                  fontSize: "2xl",
                  position: "absolute",
                  right: "0",
                }}
                onPress={handleClear}
                variant="ghost"
              >
                <RiCloseLine />
              </IconButton>
            </Flex>
          )}
          <Flex
            height="100%"
            alignItems="center"
            position="absolute"
            width="28px"
            right={sidebarShown ? "-8px" : "-28px"}
          >
            <Fade isOpen={collapseBtnShown}>
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
      </styled.div>
    </>
  );
};

export default SideBarHeader;
