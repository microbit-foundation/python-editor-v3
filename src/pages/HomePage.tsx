/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, css, Icon, IconButton } from "@microbit/ui";
import { CarouselRow } from "@microbit/ui-carousel";
import { NameProjectDialog, ProjectCard } from "@microbit/ui-patterns";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { RiAddLine, RiFolderOpenLine, RiUpload2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink, useNavigate } from "react-router";
import FileDropTarget from "../common/FileDropTarget";
import { useDeployment } from "../deployment";
import { useSettings } from "../settings/settings";
import { createProjectsPageUrl } from "../urls";
import ActionCard from "./ActionCard";
import DefaultPageLayout from "./DefaultPageLayout";
import ProjectIcon from "./ProjectIcon";
import HomepageBanner from "./HomepageBanner";
import {
  useImportProjectFiles,
  usePageProjects,
  useProjectPageActions,
} from "./project-page-actions";
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
  const importFiles = useImportProjectFiles();
  const handleDrop = useCallback(
    (files: File[]) => void importFiles(files, "drop"),
    [importFiles]
  );
  return (
    <DefaultPageLayout>
      <FileDropTarget data-testid="home-drop-target" onFileDrop={handleDrop}>
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
      </FileDropTarget>
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
        actions={[
          <ImportProjectButton key="import" />,
          <ViewAllProjectsLink key="view-all" />,
        ]}
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

/**
 * Chooses files to import as a new project. Icon only where the row's
 * heading leaves no room for the label.
 */
const ImportProjectButton = () => {
  const intl = useIntl();
  const importFiles = useImportProjectFiles();
  const inputRef = useRef<HTMLInputElement>(null);
  const choose = useCallback(() => inputRef.current?.click(), []);
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      // Clear the input so choosing the same file again triggers a change.
      e.target.value = "";
      if (files.length > 0) {
        void importFiles(files, "file_picker");
      }
    },
    [importFiles]
  );
  const label = intl.formatMessage({ id: "import-file-action" });
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleChange}
        data-testid="import-project-input"
      />
      <IconButton
        variant="ghost"
        aria-label={label}
        onPress={choose}
        css={{ display: { base: "inline-flex", sm: "none" } }}
      >
        <Icon as={RiUpload2Line} />
      </IconButton>
      <Button
        variant="ghost"
        startIcon={<Icon as={RiUpload2Line} />}
        onPress={choose}
        css={{ display: { base: "none", sm: "inline-flex" } }}
      >
        {label}
      </Button>
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
