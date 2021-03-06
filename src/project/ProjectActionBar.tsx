import { BoxProps, HStack } from "@chakra-ui/react";
import DeviceConnection from "./DeviceConnection";
import ProjectNameEditable from "./ProjectNameEditable";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  return (
    <HStack justifyContent="space-between" {...props}>
      <DeviceConnection />
      <HStack>
        <ProjectNameEditable />
        <ShareButton />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
