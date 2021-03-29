import { BoxProps, HStack } from "@chakra-ui/react";
import DeviceConnection from "./DeviceConnection";
import OpenButton from "./OpenButton";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  return (
    <HStack {...props} justifyContent="space-between">
      <HStack>
        <DeviceConnection />
      </HStack>
      <HStack>
        <OpenButton mode="button" size="lg" />
        <ShareButton size="lg" />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
