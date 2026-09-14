/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  css,
  cx,
  Flex,
  Grid,
  Heading,
  HStack,
  Slide,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from "@microbit/ui";
import {
  defaultSortDirection,
  ProjectCard,
  ProjectSearchInput,
  ProjectSortDirection,
  ProjectSortField,
  ProjectSortInput,
  ProjectsToolbar,
  ProjectsToolbarHandle,
  rankProjects,
  sortProjects,
  useProjectSelection,
} from "@microbit/ui-patterns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import FileDropTarget from "../common/FileDropTarget";
import { useLogging } from "../logging/logging-hooks";
import DefaultPageLayout from "./DefaultPageLayout";
import ProjectIcon from "./ProjectIcon";
import {
  PageProject,
  usePageProjects,
  useProjectPageActions,
  useImportProjectFiles,
} from "./project-page-actions";

const fileNames = (project: PageProject) => project.fileNames;

const ProjectsPage = () => {
  const projects = usePageProjects();
  const logging = useLogging();
  const intl = useIntl();
  const mobileIconOnly = useBreakpointValue({ base: true, md: false });

  const selection = useProjectSelection(projects);
  const { selectedIds } = selection;
  const { actions, open } = useProjectPageActions(
    "projects",
    projects,
    selectedIds
  );

  const [field, setField] = useState<ProjectSortField>("timestamp");
  const [direction, setDirection] = useState<ProjectSortDirection>("desc");
  const handleFieldChange = (next: ProjectSortField) => {
    const nextDirection = defaultSortDirection(next);
    setField(next);
    setDirection(nextDirection);
    logging.event({
      type: "project_sort",
      detail: { field: next, direction: nextDirection },
    });
  };
  const toggleDirection = () => {
    const next = direction === "asc" ? "desc" : "asc";
    setDirection(next);
    logging.event({ type: "project_sort", detail: { field, direction: next } });
  };

  const importFiles = useImportProjectFiles();
  const handleDrop = useCallback(
    (files: File[]) => void importFiles(files, "drop"),
    [importFiles]
  );

  const [query, setQuery] = useState("");
  const handleQueryChange = useCallback(
    (value: string) => {
      if (value.trim()) {
        selection.clear();
      }
      setQuery(value);
    },
    [selection]
  );
  // One project_search per intentional search, not per keystroke.
  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const handle = setTimeout(() => {
      logging.event({ type: "project_search" });
    }, 400);
    return () => clearTimeout(handle);
  }, [logging, query]);

  const shown = useMemo(
    () =>
      query.trim()
        ? rankProjects(projects, query, fileNames)
        : sortProjects(projects, field, direction, intl.locale),
    [direction, field, intl.locale, projects, query]
  );

  const desktopToolbarRef = useRef<ProjectsToolbarHandle>(null);
  const mobileToolbarRef = useRef<ProjectsToolbarHandle>(null);
  const handleSkipToToolbar = useCallback(() => {
    if (!desktopToolbarRef.current?.focus()) {
      mobileToolbarRef.current?.focus();
    }
  }, []);

  return (
    <>
      {actions.dialogs}
      <DefaultPageLayout backToHome>
        <FileDropTarget
          data-testid="projects-drop-target"
          onFileDrop={handleDrop}
          display="flex"
          flexDirection="column"
          flexGrow={1}
        >
          <VStack as="main" alignItems="center" flexGrow={1}>
            <Box
              w="100%"
              maxW="1180px"
              p={4}
              mt={4}
              display="flex"
              flexDir="column"
              flexGrow={1}
            >
              <Heading as="h1" size="lg" mb={4}>
                <FormattedMessage id="my-projects-row-title" />
              </Heading>
              <HStack mb={4} justifyContent="space-between" alignItems="center">
                <ProjectSearchInput
                  value={query}
                  onChange={handleQueryChange}
                  className={css({ maxW: "30ch", my: "1px" })}
                />
                {selection.hasSelection && (
                  <Box
                    display={{ base: "none", lg: "block" }}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="lg"
                    ml="auto"
                  >
                    <ProjectsToolbar
                      ref={desktopToolbarRef}
                      selectedCount={selectedIds.length}
                      onRename={actions.rename}
                      onDuplicate={actions.duplicate}
                      onDelete={actions.delete}
                      onClearSelection={selection.clear}
                    />
                  </Box>
                )}
                <ProjectSortInput
                  className={cx(
                    css({ ml: "auto" }),
                    selection.hasSelection
                      ? css({ display: { base: "flex", lg: "none" } })
                      : undefined
                  )}
                  field={field}
                  onFieldChange={handleFieldChange}
                  direction={direction}
                  onToggleDirection={toggleDirection}
                  hasSearchQuery={!!query.trim()}
                />
              </HStack>
              {shown.length > 0 ? (
                <Grid
                  mt={3}
                  gap={3}
                  gridTemplateColumns={{
                    base: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  }}
                  pb={selection.hasSelection ? { base: 16, lg: 0 } : 0}
                >
                  {shown.map((project) => (
                    <Box key={project.id} minH="233px">
                      <ProjectCard
                        project={project}
                        isSelected={selection.isSelected(project.id)}
                        onToggleSelected={selection.toggle}
                        onSkipToToolbar={handleSkipToToolbar}
                        onOpen={open}
                        onDelete={actions.delete}
                        onRename={actions.rename}
                        onDuplicate={actions.duplicate}
                      >
                        <ProjectIcon hasCheckbox />
                      </ProjectCard>
                    </Box>
                  ))}
                </Grid>
              ) : (
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  flexGrow={1}
                  p={12}
                >
                  <Text>
                    <FormattedMessage id="no-projects" />
                  </Text>
                </Stack>
              )}
            </Box>
          </VStack>
        </FileDropTarget>
      </DefaultPageLayout>
      <Slide isOpen={selection.hasSelection} css={{ zIndex: 10 }}>
        <Flex
          justifyContent="center"
          display={{ base: "flex", lg: "none" }}
          bg="white"
          boxShadow="0 -2px 8px rgba(0,0,0,0.1)"
          borderTop="1px solid"
          borderColor="gray.200"
          py={2}
          px={4}
        >
          <ProjectsToolbar
            ref={mobileToolbarRef}
            selectedCount={selection.lastSelectedIds.length}
            onRename={actions.rename}
            onDuplicate={actions.duplicate}
            onDelete={actions.delete}
            onClearSelection={selection.clear}
            isAttached={false}
            iconOnly={mobileIconOnly}
            size="lg"
          />
        </Flex>
      </Slide>
    </>
  );
};

export default ProjectsPage;
