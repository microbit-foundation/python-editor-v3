/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Icon,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuTrigger,
  Tooltip,
} from "@microbit/ui";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiEdit2Line,
  RiHome2Line,
} from "react-icons/ri";
import { VscFiles } from "react-icons/vsc";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router";
import { css, cx } from "styled-system/css";
import { Box, HStack, styled } from "styled-system/jsx";
import { button } from "styled-system/recipes";
import { MAIN_FILE } from "../fs/fs";
import { useProjectsDatabaseActive } from "../fs/storage-status";
import { useIframeMode } from "../iframe-mode-hooks";
import { useProject, useProjectActions } from "../project/project-hooks";
import { useRouterState } from "../router-hooks";
import { createHomePageUrl } from "../urls";

/**
 * How far the crumbs have given way to fit. The project name gives way
 * last: Home loses its label, then the back-to-main link goes, then the
 * file collapses to an icon, then the project name truncates.
 */
type Squeeze = 0 | 1 | 2 | 3 | 4;

/** The steps measured for fit; past them the project name truncates. */
const measuredSqueezes = [0, 1, 2, 3] as const;

interface ProjectBreadcrumbProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Home, the project name (which renames it) and the open file (a menu of
 * the project's files), with a way back to main.py from any other file.
 */
const ProjectBreadcrumb = ({
  filename,
  onSelectedFileChanged,
}: ProjectBreadcrumbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [squeeze, setSqueeze] = useState<Squeeze>(0);

  // Hidden copies give the width each step needs, so the step is chosen in
  // one go as the space changes rather than by trying each in turn.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const copies = measureRefs.current;
    if (!container || copies.some((copy) => !copy)) {
      return;
    }
    const update = () => {
      const available = container.clientWidth;
      const fits = copies.findIndex((copy) => copy!.scrollWidth <= available);
      setSqueeze((fits === -1 ? 4 : fits) as Squeeze);
    };
    update();
    const observer = new ResizeObserver(update);
    [container, ...copies].forEach((element) => observer.observe(element!));
    return () => observer.disconnect();
  }, []);

  const crumbs = { filename, onSelectedFileChanged };
  return (
    <Box ref={containerRef} position="relative" flex="1 1 0" minW="0">
      <Crumbs {...crumbs} squeeze={squeeze} shown />
      {/* Clips the copies, which can be wider than the space, here rather
          than on the crumbs, whose focus rings it would cut off. */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="0"
        height="0"
        overflow="hidden"
      >
        {measuredSqueezes.map((step) => (
          <Measure
            key={step}
            ref={(element) => {
              measureRefs.current[step] = element;
            }}
          >
            <Crumbs {...crumbs} squeeze={step} />
          </Measure>
        ))}
      </Box>
    </Box>
  );
};

/** Out of sight and out of the tab order and accessibility tree. */
const Measure = ({
  ref,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
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
    width="max-content"
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
      <ProjectCrumb truncate={squeeze === 4} shown={shown} />
      <Separator />
      <FileCrumb
        filename={filename}
        onSelectedFileChanged={onSelectedFileChanged}
        iconOnly={squeeze >= 3}
      />
      {filename !== MAIN_FILE && squeeze < 2 && (
        <Button
          variant="unstyled"
          css={{
            flexShrink: 0,
            fontWeight: "normal",
            textDecoration: "underline",
            whiteSpace: "nowrap",
          }}
          onPress={() => onSelectedFileChanged(MAIN_FILE)}
        >
          <FormattedMessage id="back-to-main" />
        </Button>
      )}
    </HStack>
  );
};

/**
 * Shared by every crumb so they read alike: one size and colour, and the
 * hover covers icon and text together.
 */
const crumbClass = css({
  gap: "1.5",
  px: "2",
  fontSize: "xl",
  fontWeight: "normal",
  // As alpha rather than opacity, which would fade the icons too.
  color: "gray.700/80",
  whiteSpace: "nowrap",
});

const crumbIconClass = css({ flexShrink: 0, color: "brand.500" });

const HomeCrumb = ({ showLabel }: { showLabel: boolean }) => {
  const intl = useIntl();
  return (
    <RouterLink
      to={createHomePageUrl()}
      aria-label={intl.formatMessage({ id: "home-action" })}
      className={cx(
        button({ variant: "ghost", size: "md" }),
        crumbClass,
        css({ flexShrink: 0 })
      )}
    >
      <RiHome2Line aria-hidden className={crumbIconClass} />
      {showLabel && <FormattedMessage id="home-action" />}
    </RouterLink>
  );
};

/** The project name, which opens the rename dialog. */
const ProjectCrumb = ({
  truncate,
  shown,
}: {
  /** Whether the name truncates with an ellipsis. */
  truncate: boolean;
  shown?: boolean;
}) => {
  const intl = useIntl();
  const { name } = useProject();
  const actions = useProjectActions();
  return (
    <Tooltip
      hasArrow
      label={intl.formatMessage({ id: "edit-name-project-hover" })}
      placement="top start"
    >
      <Button
        variant="ghost"
        size="md"
        className={crumbClass}
        aria-label={intl.formatMessage(
          { id: "edit-project-name-crumb" },
          { name }
        )}
        onPress={() => actions.editProjectName()}
        // Literals so Panda can extract both.
        css={{ flexShrink: truncate ? 1 : 0 }}
      >
        <RiEdit2Line aria-hidden className={crumbIconClass} />
        <styled.span
          data-testid={shown ? "project-name" : undefined}
          overflow={truncate ? "hidden" : "visible"}
          textOverflow={truncate ? "ellipsis" : "clip"}
          minW={truncate ? "8ch" : "auto"}
        >
          {name}
        </styled.span>
      </Button>
    </Tooltip>
  );
};

interface FileCrumbProps extends ProjectBreadcrumbProps {
  /** Just the files icon, without the name, when space is short. */
  iconOnly: boolean;
}

/**
 * The open file, as a menu of the project's files and a way to the Files
 * tab.
 */
const FileCrumb = ({
  filename,
  onSelectedFileChanged,
  iconOnly,
}: FileCrumbProps) => {
  const intl = useIntl();
  const { files } = useProject();
  const [, setRouterState] = useRouterState();
  const manageFiles = useCallback(() => {
    // After the menu has returned focus to this trigger, so the Files
    // panel keeps it.
    requestAnimationFrame(() =>
      setTimeout(() => setRouterState({ tab: "project", focus: true }, "user"))
    );
  }, [setRouterState]);
  return (
    <MenuTrigger>
      <Button
        variant="ghost"
        size="md"
        className={crumbClass}
        aria-label={intl.formatMessage(
          { id: "choose-file-menu" },
          { filename }
        )}
        css={{ flexShrink: 0 }}
      >
        <VscFiles aria-hidden className={crumbIconClass} />
        {!iconOnly && (
          <styled.span
            maxWidth="15ch"
            textOverflow="ellipsis"
            overflowX="hidden"
          >
            {filename}
          </styled.span>
        )}
        <RiArrowDownSLine aria-hidden />
      </Button>
      <MenuList>
        {files.map((file) => (
          <MenuItem
            key={file.name}
            id={file.name}
            textValue={file.name}
            icon={file.name === filename ? <Icon as={RiCheckLine} /> : <Box />}
            onAction={() => onSelectedFileChanged(file.name)}
          >
            {file.name}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem
          id="manage-files"
          textValue={intl.formatMessage({ id: "manage-project-files-action" })}
          icon={<Icon as={VscFiles} />}
          onAction={manageFiles}
        >
          <FormattedMessage id="manage-project-files-action" />
        </MenuItem>
      </MenuList>
    </MenuTrigger>
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
