/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "@microbit/ui";
import { CarouselRow } from "@microbit/ui-carousel";
import { NameProjectDialog, ProjectCard } from "@microbit/ui-patterns";
import { useCallback, useState } from "react";
import { RiAddLine, RiFolderOpenLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink, useNavigate } from "react-router";
import { useDeployment } from "../deployment";
import { useSettings } from "../settings/settings";
import { createProjectsPageUrl } from "../urls";
import ActionCard from "./ActionCard";
import DefaultPageLayout from "./DefaultPageLayout";
import ProjectIcon from "./ProjectIcon";
import HomepageBanner from "./HomepageBanner";
import { usePageProjects, useProjectPageActions } from "./project-page-actions";
import {
  createHelpCards,
  createLessonCards,
  createProjectIdeaCards,
} from "./resource-cards";

const numCardsDisplayed = 10;

const HomePage = () => {
  const intl = useIntl();
  const [{ languageId }] = useSettings();
  const brand = useDeployment();
  return (
    <DefaultPageLayout>
      <HomepageBanner />
      <ProjectsRow />
      <CarouselRow
        carouselItems={createProjectIdeaCards(intl, languageId)}
        title={<FormattedMessage id="project-ideas-row-title" />}
        navigation
      />
      <CarouselRow
        carouselItems={createLessonCards(intl)}
        title={<FormattedMessage id="teacher-resources-row-title" />}
        navigation
      />
      <CarouselRow
        carouselItems={createHelpCards(intl, brand)}
        title={<FormattedMessage id="help-resources-row-title" />}
        navigation
      />
    </DefaultPageLayout>
  );
};

const ProjectsRow = () => {
  const projects = usePageProjects();
  const { actions, open, create } = useProjectPageActions("home", projects);
  const cards = [
    <NewProjectCard key="new-project" onCreate={create} />,
    ...projects.slice(0, numCardsDisplayed).map((project) => (
      <ProjectCard
        key={project.id}
        project={project}
        description={project.fileNames.join(", ")}
        onOpen={open}
        onDelete={actions.requestDelete}
        onRename={actions.rename}
        onDuplicate={actions.duplicate}
      >
        <ProjectIcon />
      </ProjectCard>
    )),
    ...(projects.length > numCardsDisplayed
      ? [<ViewAllProjectsCard key="view-all" />]
      : []),
  ];
  return (
    <>
      {actions.dialogs}
      <CarouselRow
        carouselItems={cards}
        title={<FormattedMessage id="my-projects-row-title" />}
        actions={<ViewAllProjectsLink />}
        navigation
      />
    </>
  );
};

const NewProjectCard = ({
  onCreate,
}: {
  onCreate: (name: string) => Promise<void>;
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const handleSave = useCallback(
    (name: string) => {
      setIsOpen(false);
      void onCreate(name);
    },
    [onCreate]
  );
  return (
    <>
      <NameProjectDialog
        isOpen={isOpen}
        onClose={close}
        onSave={handleSave}
        initialName={intl.formatMessage({ id: "untitled-project" })}
        confirmText={<FormattedMessage id="create-project-action" />}
      />
      <ActionCard onClick={() => setIsOpen(true)} icon={RiAddLine}>
        <FormattedMessage id="new-project-action" />
      </ActionCard>
    </>
  );
};

const ViewAllProjectsCard = () => {
  const navigate = useNavigate();
  return (
    <ActionCard
      onClick={() => void navigate(createProjectsPageUrl())}
      icon={RiFolderOpenLine}
    >
      <FormattedMessage id="view-all-projects" />
    </ActionCard>
  );
};

const ViewAllProjectsLink = () => (
  <RouterLink
    to={createProjectsPageUrl()}
    className={css({
      color: "brand.700",
      fontWeight: "semibold",
      borderRadius: "md",
      px: 2,
      py: 1,
      textDecoration: "none",
      _hover: { textDecoration: "underline" },
      _focusVisible: { focusRing: "outline" },
    })}
  >
    <FormattedMessage id="view-all-projects" />
  </RouterLink>
);

export default HomePage;
