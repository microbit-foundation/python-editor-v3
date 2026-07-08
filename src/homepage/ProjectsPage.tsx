/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Slide,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ProjectDataWithFiles } from "../fs/db";
import { useProjects } from "../project/projects-hooks";
import DefaultPageLayout from "./DefaultPageLayout";
import ProjectCard from "./ProjectCard";
import { ProjectNameDialogReason } from "./project-name";
import ProjectsToolbar from "./ProjectsToolbar";
import Search from "./Search";
import SortInput from "./SortInput";
import { useProjectCardActions } from "./use-project-card-actions";

type OrderByField = "timestamp" | "name";

const searchScore = (project: ProjectDataWithFiles, terms: string[]): number => {
  const name = project.name.toLowerCase();
  const fileNames = project.fileNames.map((f) => f.toLowerCase());
  // Every term must match the name or one of the file names.
  const allMatch = terms.every(
    (t) => name.includes(t) || fileNames.some((f) => f.includes(t))
  );
  if (!allMatch) {
    return 0;
  }
  let score = 0;
  for (const term of terms) {
    if (name === term) {
      score += 100;
    } else if (name.startsWith(term)) {
      score += 50;
    } else if (name.includes(term)) {
      score += 30;
    }
    if (fileNames.some((f) => f.includes(term))) {
      score += 5;
    }
  }
  return score;
};

const ProjectsPage = () => {
  const { projects } = useProjects();
  const { handleOpen, handleRenameDuplicate, handleDelete, handleDeleteMany } =
    useProjectCardActions("projects");

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [orderByField, setOrderByField] = useState<OrderByField>("timestamp");
  const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
    "desc"
  );
  const mobileIconOnly = useBreakpointValue({ base: true, md: false });

  // Drop selections for projects that no longer exist.
  useEffect(() => {
    const ids = new Set(projects.map((p) => p.id));
    setSelectedProjectIds((prev) => prev.filter((id) => ids.has(id)));
  }, [projects]);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim()) {
        setSelectedProjectIds([]);
      }
      setQuery(e.target.value);
    },
    []
  );

  const handleOrderByFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as OrderByField;
      setOrderByField(value);
      setOrderByDirection(value === "name" ? "asc" : "desc");
    },
    []
  );
  const toggleOrderByDirection = useCallback(() => {
    setOrderByDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const updateSelectedProjects = useCallback((id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);
  const clearSelection = useCallback(() => setSelectedProjectIds([]), []);

  const processedProjects = useMemo(() => {
    const trimmed = query.toLowerCase().trim();
    if (trimmed) {
      const terms = trimmed.split(/\s+/);
      return projects
        .map((p) => ({ project: p, score: searchScore(p, terms) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.project);
    }
    const sorted = [...projects].sort((a, b) => {
      if (orderByField === "name") {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }
      return a.timestamp - b.timestamp;
    });
    return orderByDirection === "desc" ? sorted.reverse() : sorted;
  }, [projects, query, orderByField, orderByDirection]);

  const hasSelection = selectedProjectIds.length > 0;
  const lastSelectionRef = useRef(selectedProjectIds);
  if (hasSelection) {
    lastSelectionRef.current = selectedProjectIds;
  }

  const desktopToolbarRef = useRef<HTMLDivElement>(null);
  const mobileToolbarRef = useRef<HTMLDivElement>(null);
  const handleSkipToToolbar = useCallback(() => {
    const toolbar = desktopToolbarRef.current?.offsetParent
      ? desktopToolbarRef.current
      : mobileToolbarRef.current;
    toolbar?.querySelector<HTMLElement>("button")?.focus();
  }, []);

  const handleToolbarRenameDuplicate = useCallback(
    (reason: ProjectNameDialogReason) => {
      if (selectedProjectIds.length === 1) {
        void handleRenameDuplicate(reason, selectedProjectIds[0]);
      }
    },
    [handleRenameDuplicate, selectedProjectIds]
  );
  const handleToolbarDelete = useCallback(() => {
    void handleDeleteMany(selectedProjectIds);
  }, [handleDeleteMany, selectedProjectIds]);

  return (
    <>
      <DefaultPageLayout showBackToHome>
        <VStack as="main" alignItems="center" flexGrow={1}>
          <Container
            maxW="1180px"
            alignItems="stretch"
            p={4}
            mt={4}
            display="flex"
            flexDir="column"
            flexGrow={1}
          >
            <Heading as="h2" size="lg" mb={4}>
              <FormattedMessage id="my-projects-row-title" />
            </Heading>
            <HStack mb={4} justifyContent="space-between" alignItems="center">
              <Search
                query={query}
                onChange={handleQueryChange}
                onClear={() => setQuery("")}
                maxW="30ch"
                my="1px"
              />
              {hasSelection && (
                <Box
                  ref={desktopToolbarRef}
                  display={{ base: "none", lg: "block" }}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  marginLeft="auto"
                >
                  <ProjectsToolbar
                    selectedProjectIds={selectedProjectIds}
                    onDeleteProject={handleToolbarDelete}
                    onRenameDuplicateProject={handleToolbarRenameDuplicate}
                    onClearSelection={clearSelection}
                  />
                </Box>
              )}
              <SortInput
                display={
                  hasSelection ? { base: "flex", lg: "none" } : undefined
                }
                value={orderByField}
                onSelectChange={handleOrderByFieldChange}
                order={orderByDirection}
                toggleOrder={toggleOrderByDirection}
                marginLeft="auto"
                hasSearchQuery={!!query.trim()}
              />
            </HStack>
            {processedProjects.length > 0 ? (
              <SimpleGrid
                mt={3}
                spacing={3}
                columns={[1, 2, 3, 4]}
                pb={hasSelection ? { base: 20, lg: 0 } : 0}
              >
                {processedProjects.map((project) => (
                  <Box key={project.id} minH="233px">
                    <ProjectCard
                      projectData={project}
                      isSelected={selectedProjectIds.includes(project.id)}
                      onSelected={updateSelectedProjects}
                      onDeleteProject={handleDelete}
                      onOpenProject={handleOpen}
                      onRenameDuplicateProject={handleRenameDuplicate}
                      onSkipToToolbar={handleSkipToToolbar}
                    />
                  </Box>
                ))}
              </SimpleGrid>
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
          </Container>
        </VStack>
      </DefaultPageLayout>
      <Slide direction="bottom" in={hasSelection} style={{ zIndex: 10 }}>
        <Flex
          justifyContent="center"
          display={{ base: "flex", lg: "none" }}
          ref={mobileToolbarRef}
          bg="white"
          shadow="0 -2px 8px rgba(0,0,0,0.1)"
          borderTopWidth="1px"
          borderColor="gray.200"
          py={2}
          px={4}
        >
          <ProjectsToolbar
            selectedProjectIds={lastSelectionRef.current}
            onDeleteProject={handleToolbarDelete}
            onRenameDuplicateProject={handleToolbarRenameDuplicate}
            onClearSelection={clearSelection}
            iconOnly={mobileIconOnly}
            size="lg"
          />
        </Flex>
      </Slide>
    </>
  );
};

export default ProjectsPage;
