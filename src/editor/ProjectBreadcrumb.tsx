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
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuTrigger,
  Tooltip,
} from "@microbit/ui";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Focusable, MenuSection } from "react-aria-components";
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiEdit2Line,
  RiHome2Line,
} from "react-icons/ri";
import { VscFiles } from "react-icons/vsc";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router";
import { css, cx } from "styled-system/css";
import { Box, styled } from "styled-system/jsx";
import { button } from "styled-system/recipes";
import { MAIN_FILE } from "../fs/fs";
import { useProjectsDatabaseActive } from "../fs/storage-status";
import { useIframeMode } from "../iframe-mode-hooks";
import { useProject, useProjectActions } from "../project/project-hooks";
import { useShowSidebarPanel } from "../workbench/sidebar-hooks";
import { createHomePageUrl } from "../urls";

/**
 * How far the crumbs have given way to fit. The project name gives way
 * last: Home loses its label, then the back-to-main link goes, then the
 * file collapses to an icon, then the project name truncates, then it
 * collapses to an icon too. Past that the crumbs overflow.
 */
type Squeeze = 0 | 1 | 2 | 3 | 4 | 5;

/** The steps measured for fit; past them the project name is an icon. */
const measuredSqueezes = [0, 1, 2, 3, 4] as const;

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
  const intl = useIntl();
  const containerRef = useRef<HTMLElement>(null);
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
      setSqueeze((fits === -1 ? 5 : fits) as Squeeze);
    };
    update();
    const observer = new ResizeObserver(update);
    [container, ...copies].forEach((element) => observer.observe(element!));
    return () => observer.disconnect();
  }, []);

  const crumbs = { filename, onSelectedFileChanged };
  return (
    <styled.nav
      ref={containerRef}
      aria-label={intl.formatMessage({ id: "breadcrumb-label" })}
      position="relative"
      flex="1 1 0"
      minW="0"
    >
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
    </styled.nav>
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
    // role="list" because Safari drops list semantics without list markers.
    <styled.ol
      role="list"
      display="flex"
      alignItems="center"
      gap="2"
      whiteSpace="nowrap"
      minW="0"
      flexShrink={1}
      listStyle="none"
      m="0"
      p="0"
    >
      {hasHome && (
        <CrumbItem>
          <HomeCrumb showLabel={squeeze === 0} />
          <Separator />
        </CrumbItem>
      )}
      <CrumbItem flexShrink={squeeze === 4 ? 1 : 0}>
        <ProjectCrumb
          truncate={squeeze === 4}
          iconOnly={squeeze === 5}
          shown={shown}
        />
        <Separator />
      </CrumbItem>
      <CrumbItem>
        <FileCrumb
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
          iconOnly={squeeze >= 3}
          shown={shown}
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
            onPress={() => {
              // As choosing main.py from the menu: focus goes to its trigger.
              pendingFocus.trigger = true;
              onSelectedFileChanged(MAIN_FILE);
            }}
          >
            <FormattedMessage id="back-to-main" />
          </Button>
        )}
      </CrumbItem>
    </styled.ol>
  );
};

/** A crumb with what follows it: its separator, or the back-to-main link. */
const CrumbItem = ({
  flexShrink = 0,
  children,
}: {
  flexShrink?: 0 | 1;
  children: React.ReactNode;
}) => (
  <styled.li
    display="flex"
    alignItems="center"
    gap="2"
    minW="0"
    // Literals so Panda can extract both.
    flexShrink={flexShrink === 1 ? 1 : 0}
  >
    {children}
  </styled.li>
);

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
    // Only for the icon alone; the label says it otherwise.
    <Tooltip
      hasArrow
      label={intl.formatMessage({ id: "home-page-tooltip" })}
      isDisabled={showLabel}
      delay={0}
    >
      <Focusable>
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
      </Focusable>
    </Tooltip>
  );
};

/** The project name, which opens the rename dialog. */
const ProjectCrumb = ({
  truncate,
  iconOnly,
  shown,
}: {
  /** Whether the name truncates with an ellipsis. */
  truncate: boolean;
  /** Just the pencil, without the name. */
  iconOnly: boolean;
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
      // No warmup when the pencil is all there is to explain it.
      delay={iconOnly ? 0 : undefined}
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
        {!iconOnly && (
          <styled.span
            data-testid={shown ? "project-name" : undefined}
            overflow={truncate ? "hidden" : "visible"}
            textOverflow={truncate ? "ellipsis" : "clip"}
            // The copy measured for truncating holds the shortest the name
            // gets before it gives way to the icon.
            maxW={truncate && !shown ? "8ch" : "none"}
          >
            {name}
          </styled.span>
        )}
      </Button>
    </Tooltip>
  );
};

interface FileCrumbProps extends ProjectBreadcrumbProps {
  /** Just the files icon, without the name, when space is short. */
  iconOnly: boolean;
  shown?: boolean;
}

/**
 * Set when a file is chosen from the menu or by "back to the main code".
 * The editor area, and so this crumb, is re-created for the new file, so
 * the new trigger takes focus.
 */
const pendingFocus = { trigger: false };

/**
 * The open file, as a menu of the project's files and a way to the Files
 * tab.
 */
const FileCrumb = ({
  filename,
  onSelectedFileChanged,
  iconOnly,
  shown,
}: FileCrumbProps) => {
  const intl = useIntl();
  const { files } = useProject();
  const showSidebarPanel = useShowSidebarPanel();
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (shown && pendingFocus.trigger) {
      pendingFocus.trigger = false;
      // After the closing menu's own attempt to restore focus.
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [shown]);
  const chooseFile = (name: string) => {
    if (name !== filename) {
      pendingFocus.trigger = true;
      onSelectedFileChanged(name);
    }
  };
  // The menu keeps focus inside it while open, then returns it to this
  // trigger as it closes. So focus is passed on to the Files panel from
  // the trigger's focus event, before it's painted there. The panel is
  // shown directly: a router change would wait on the route's loader.
  const manageFilesPending = useRef(false);
  const manageFiles = useCallback(() => {
    manageFilesPending.current = true;
    // Long enough for the menu's exit animation. Should focus never come
    // back, a later visit to the trigger isn't sent away.
    setTimeout(() => {
      manageFilesPending.current = false;
    }, 1000);
  }, []);
  const handleTriggerFocus = useCallback(() => {
    if (manageFilesPending.current) {
      manageFilesPending.current = false;
      showSidebarPanel("project");
    }
  }, [showSidebarPanel]);
  return (
    <MenuTrigger>
      {/* Only for the icon alone; the name shows otherwise. */}
      <Tooltip
        hasArrow
        label={intl.formatMessage({ id: "choose-file-tooltip" })}
        isDisabled={!iconOnly}
        delay={0}
      >
        <Button
          ref={triggerRef}
          onFocus={handleTriggerFocus}
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
      </Tooltip>
      <MenuList>
        {/* Separate sections so only the files are options. VoiceOver
            doesn't give positions ("1 of 2") within sections. */}
        <MenuOptionGroup type="radio" value={filename}>
          {files.map((file) => (
            <MenuItemOption
              key={file.name}
              value={file.name}
              textValue={file.name}
              shouldCloseOnSelect
              onAction={() => chooseFile(file.name)}
            >
              {file.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
        <MenuDivider />
        <MenuSection>
          <MenuItem
            id="manage-files"
            textValue={intl.formatMessage({
              id: "manage-project-files-action",
            })}
            icon={<Icon as={VscFiles} />}
            onAction={manageFiles}
          >
            <FormattedMessage id="manage-project-files-action" />
          </MenuItem>
        </MenuSection>
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
