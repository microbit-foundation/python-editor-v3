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

const ProjectBrowser = () => {
  const { projectList, setProjectById } = useProjectStorage();
  const [_, setParams] = useRouterState();
  return (
    <Grid
      position="relative"
      backgroundColor="whitesmoke"
      templateColumns="repeat(auto-fill, 400px)"
      pb={[0, 5, 20]}
    >
      {projectList?.map((proj) => (
        <GridItem key={proj.id}>
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
              onClick={() => {
                setProjectById(proj.id);
                setParams({ tab: "project" });
              }}
            >
              <Stack spacing={5}>
                <HStack justifyContent="space-between" w="100%">
                  <Heading as="h2">{proj.projectName}</Heading>
                </HStack>
                <Text size="lg">Here is a test box</Text>
              </Stack>
            </Stack>
          </Flex>
        </GridItem>
      ))}
    </Grid>
  );
};

export default ProjectBrowser;
