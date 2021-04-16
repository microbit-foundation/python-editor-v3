import { BoxProps, HStack } from "@chakra-ui/react";
import DeviceConnection from "./DeviceConnection";
import LoadButton from "./LoadButton";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  const size = "lg";
  return (
    <HStack {...props} justifyContent="space-between">
      <HStack>
        <DeviceConnection size={size} />
      </HStack>
      <HStack>
        <LoadButton mode="button" size={size} />
        <ShareButton size={size} />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
