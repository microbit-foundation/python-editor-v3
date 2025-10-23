import {
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useProjectStorage } from "./ProjectStorageProvider";
import { useRouterState } from "../router-hooks";
import { ReactNode } from "react";
import { useProjectActions } from "../project/project-hooks";
import { timeAgo } from "./utils";

const ProjectBrowser = () => {
  const { projectList } = useProjectStorage();
  const { newProject, loadProject } = useProjectActions();
  const [_, setParams] = useRouterState();

  const rtf = new Intl.RelativeTimeFormat("en", { style: "short" });

  return (
    <Grid
      position="relative"
      backgroundColor="whitesmoke"
      templateColumns="repeat(auto-fill, 400px)"
      pb={[0, 5, 20]}
    >
      <ProjectItem
        key="newproject"
        onClick={async () => {
          newProject();
          setParams({ tab: "project" });
        }}
      >
        <HStack justifyContent="space-between" w="100%">
          <Heading as="h2">New project</Heading>
        </HStack>
        <Text size="lg">Click to create</Text>
      </ProjectItem>
      {projectList?.map((proj) => (
        <ProjectItem
          key={proj.id}
          onClick={() => {
            loadProject(proj.id);
            setParams({ tab: "project" });
          }}
        >
          <HStack justifyContent="space-between" w="100%">
            <Heading as="h2">{proj.projectName}</Heading>
          </HStack>
          <Text size="lg">{timeAgo(new Date(proj.modifiedDate))}</Text>
        </ProjectItem>
      ))}
    </Grid>
  );
};

interface ProjectItemProps {
  children: ReactNode;
  onClick: () => void;
}

const ProjectItem = ({ onClick, children }: ProjectItemProps) => (
  <GridItem>
    <Flex
      bgColor="whitesmoke"
      flexDir="column"
      alignItems="center"
      justifyContent="flex-start"
      cursor="pointer"
    >
      <Stack
        bgColor="white"
        spacing={5}
        mt={[0, 5, 20]}
        borderRadius={[0, "20px"]}
        borderWidth={[null, 1]}
        borderBottomWidth={1}
        borderColor={[null, "gray.300"]}
        py={[5, 8]}
        px={[3, 5, 8]}
        minW={[null, null, "m"]}
        alignItems="stretch"
        onClick={onClick}
      >
        {children}
      </Stack>
    </Flex>
  </GridItem>
);

export default ProjectBrowser;
