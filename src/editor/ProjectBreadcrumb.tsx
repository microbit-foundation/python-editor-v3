/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@microbit/ui";
import { useLayoutEffect, useRef, useState } from "react";
import { RiArrowRightSLine, RiHome2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router";
import { css, cx } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import { button } from "styled-system/recipes";
import { MAIN_FILE } from "../fs/fs";
import { useProjectsDatabaseActive } from "../fs/storage-status";
import { useIframeMode } from "../iframe-mode-hooks";
import ProjectNameEditable from "../project/ProjectNameEditable";
import { createHomePageUrl } from "../urls";
import ActiveFileInfo from "./ActiveFileInfo";

/**
 * How far the crumbs have given way to fit: Home loses its label, then the
 * project name truncates, then collapses.
 */
type Squeeze = 0 | 1 | 2 | 3;

interface ProjectBreadcrumbProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Home, the project name (which renames it) and, for a file other than
 * main.py, that file and a way back to main.py.
 */
const ProjectBreadcrumb = ({
  filename,
  onSelectedFileChanged,
}: ProjectBreadcrumbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);
  const homeIconRef = useRef<HTMLDivElement>(null);
  const narrowestRef = useRef<HTMLDivElement>(null);
  const [squeeze, setSqueeze] = useState<Squeeze>(0);

  // Hidden copies give the width each step needs, so the step is chosen in
  // one go as the space changes rather than by trying each in turn.
  useLayoutEffect(() => {
    const elements = [containerRef, fullRef, homeIconRef, narrowestRef].map(
      (ref) => ref.current
    );
    const [container, full, homeIcon, narrowest] = elements;
    if (!container || !full || !homeIcon || !narrowest) {
      return;
    }
    const update = () => {
      const available = container.clientWidth;
      setSqueeze(
        full.scrollWidth <= available
          ? 0
          : homeIcon.scrollWidth <= available
          ? 1
          : narrowest.scrollWidth <= available
          ? 2
          : 3
      );
    };
    update();
    const observer = new ResizeObserver(update);
    elements.forEach((element) => observer.observe(element!));
    return () => observer.disconnect();
  }, []);

  const crumbs = { filename, onSelectedFileChanged };
  return (
    <Box
      ref={containerRef}
      position="relative"
      flex="1 1 0"
      minW="0"
      overflow="hidden"
    >
      <Crumbs {...crumbs} squeeze={squeeze} shown />
      <Measure ref={fullRef}>
        <Crumbs {...crumbs} squeeze={0} />
      </Measure>
      <Measure ref={homeIconRef}>
        <Crumbs {...crumbs} squeeze={1} />
      </Measure>
      {/* No width, so the name shrinks to its narrowest. */}
      <Measure ref={narrowestRef} narrowest>
        <Crumbs {...crumbs} squeeze={2} />
      </Measure>
    </Box>
  );
};

/** Out of sight and out of the tab order and accessibility tree. */
const Measure = ({
  ref,
  narrowest,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
  narrowest?: boolean;
  children: React.ReactNode;
}) => (
  <Box
    ref={ref}
    aria-hidden
    position="absolute"
    top="0"
    left="0"
    visibility="hidden"
    pointerEvents="none"
    display="flex"
    overflow="hidden"
    // Literals so Panda can extract both.
    width={narrowest ? "0" : "max-content"}
  >
    {children}
  </Box>
);

interface CrumbsProps extends ProjectBreadcrumbProps {
  squeeze: Squeeze;
  /** The crumbs on screen, rather than a copy measured for fit. */
  shown?: boolean;
}

const Crumbs = ({
  filename,
  onSelectedFileChanged,
  squeeze,
  shown,
}: CrumbsProps) => {
  const projectsDatabaseActive = useProjectsDatabaseActive();
  const iframeMode = useIframeMode();
  const hasHome = projectsDatabaseActive && !iframeMode;
  return (
    <HStack gap="2" whiteSpace="nowrap" minW="0" flexShrink={1}>
      {hasHome && (
        <>
          <HomeCrumb showLabel={squeeze === 0} />
          <Separator />
        </>
      )}
      <ProjectNameEditable
        color="gray.700"
        opacity="80%"
        fontSize="xl"
        data-testid={shown ? "project-name" : undefined}
        clickToEdit
        squeeze={
          squeeze === 3 ? "collapse" : squeeze === 2 ? "truncate" : "none"
        }
      />
      {filename !== MAIN_FILE && (
        <>
          <Separator />
          <ActiveFileInfo
            filename={filename}
            onSelectedFileChanged={onSelectedFileChanged}
          />
        </>
      )}
    </HStack>
  );
};

const HomeCrumb = ({ showLabel }: { showLabel: boolean }) => {
  const intl = useIntl();
  return (
    <RouterLink
      to={createHomePageUrl()}
      aria-label={intl.formatMessage({ id: "home-action" })}
      className={cx(
        button({ variant: "ghost", size: "md" }),
        css({
          flexShrink: 0,
          gap: "2",
          px: "2",
          color: "brand.600",
          fontSize: "xl",
          fontWeight: "normal",
        })
      )}
    >
      {/* 1em of the xl text, as the pencil and other button icons. */}
      <RiHome2Line aria-hidden />
      {showLabel && <FormattedMessage id="home-action" />}
    </RouterLink>
  );
};

const Separator = () => (
  <Icon
    as={RiArrowRightSLine}
    aria-hidden
    css={{ flexShrink: 0, width: "24px", height: "24px", color: "gray.500" }}
  />
);

export default ProjectBreadcrumb;
