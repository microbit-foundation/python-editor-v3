import { BoxProps, HStack } from "@chakra-ui/react";
import DeviceConnection from "./DeviceConnection";
import OpenButton from "./OpenButton";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  const size = "lg";
  return (
    <HStack {...props} justifyContent="space-between">
      <HStack>
        <DeviceConnection size={size} />
      </HStack>
      <HStack>
        <OpenButton mode="button" size={size} />
        <ShareButton size={size} />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
