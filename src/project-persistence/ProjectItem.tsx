import { CloseButton, GridItem, Heading, HStack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ProjectEntry } from "./project-list-db";
import { timeAgo } from "./utils";

interface ProjectItemProps {
    project: ProjectEntry;
    loadProject: (projectId: string) => void;
    deleteProject: (projectId: string) => void;
}

interface ProjectItemBaseProps {
  children: ReactNode;
  onClick: () => void;
}

const ProjectItemBase = ({ onClick, children }: ProjectItemBaseProps) => (
  <GridItem
    role="button"
    bgColor="white"
    display="block"
    position="relative"
    mx={[0, 2, 5]}
    my={[0, 2, 10]}
    borderRadius={[0, "20px"]}
    borderWidth={[null, 1]}
    borderBottomWidth={1}
    borderColor={[null, "gray.300"]}
    py={[5, 8]}
    px={[3, 5, 8]}
    w="21rem"
    h="15rem"
    alignItems="stretch"
    onClick={onClick}
  >
    {children}
  </GridItem>
);

export const ProjectItem = ({project, loadProject, deleteProject}: ProjectItemProps) => (
    <ProjectItemBase onClick={() => loadProject(project.id)}>
          <HStack justifyContent="space-between" w="100%">
            <Heading as="h2" isTruncated>
              {project.projectName}
            </Heading>
          </HStack>
          <Text size="lg">{timeAgo(new Date(project.modifiedDate))}</Text>

          <CloseButton
            position="absolute"
            right={4}
            top={4}
            onClick={(e) => {
              deleteProject(project.id);
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </ProjectItemBase>
)

interface AddProjectItemProps {
    newProject: () => void;
}

export const AddProjectItem = ({newProject}: AddProjectItemProps) =>
    <ProjectItemBase
        onClick={newProject}
      >
        <HStack justifyContent="space-between" w="100%">
          <Heading as="h2">New project</Heading>
        </HStack>
        <Text size="lg">Click to create</Text>
      </ProjectItemBase>
