/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 * Modifications (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Heading } from "@chakra-ui/react";
import { FormattedMessage, useIntl } from "react-intl";
import { useProjects } from "../project/projects-hooks";
import { useSettings } from "../settings/settings";
import CarouselRow from "./carousel/CarouselRow";
import DefaultPageLayout from "./DefaultPageLayout";
import { createHelpCards } from "./HelpCards";
import HomepageBanner from "./HomepageBanner";
import ImportProjectButton from "./ImportProjectButton";
import { createLessonCards } from "./LessonCards";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";
import { createProjectIdeaCards } from "./ProjectIdeaCards";
import { useProjectCardActions } from "./use-project-card-actions";
import ViewAllProjectsCard from "./ViewAllProjectsCard";
import ViewAllProjectsLink from "./ViewAllProjectsLink";

const numCardsDisplayed = 10;

const HomePage = () => {
  const intl = useIntl();
  const [{ languageId }] = useSettings();
  const { projects } = useProjects();
  const { handleCreate, handleOpen, handleRenameDuplicate, handleDelete } =
    useProjectCardActions("home");

  const projectCards: JSX.Element[] = [
    <NewProjectCard key="new-project" onClick={handleCreate} />,
    ...projects.slice(0, numCardsDisplayed).map((project) => (
      <ProjectCard
        key={project.id}
        projectData={project}
        onDeleteProject={handleDelete}
        onOpenProject={handleOpen}
        onRenameDuplicateProject={handleRenameDuplicate}
      />
    )),
    ...(projects.length > numCardsDisplayed
      ? [<ViewAllProjectsCard key="view-all" />]
      : []),
  ];

  return (
    <DefaultPageLayout>
      <HomepageBanner />
      <CarouselRow
        containerMessageId="my-projects-row-carousel"
        carouselItems={projectCards}
        actions={[
          <ImportProjectButton key="import" />,
          <ViewAllProjectsLink key="view-all" />,
        ]}
        titleElement={
          <Heading as="h2" size="lg">
            <FormattedMessage id="my-projects-row-title" />
          </Heading>
        }
      />
      <CarouselRow
        containerMessageId="project-ideas-row-carousel"
        carouselItems={createProjectIdeaCards(intl, languageId)}
        titleId="project-ideas-row-title"
      />
      <CarouselRow
        containerMessageId="teacher-resources-row-carousel"
        carouselItems={createLessonCards(intl)}
        titleId="teacher-resources-row-title"
      />
      <CarouselRow
        containerMessageId="help-resources-row-carousel"
        carouselItems={createHelpCards(intl)}
        titleId="help-resources-row-title"
      />
    </DefaultPageLayout>
  );
};

export default HomePage;
