import { BoxProps, HStack } from "@chakra-ui/react";
import ConnectDisconnectButton from "./ConnectDisconnectButton";
import DownloadFlashButton from "./DownloadFlashButton";
import LoadButton from "./LoadButton";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  const size = "lg";
  return (
    <HStack {...props} justifyContent="space-between">
      <HStack>
        <DownloadFlashButton size={size} />
      </HStack>
      <HStack>
        <ConnectDisconnectButton />
        <LoadButton
          variant="outline"
          mode="button"
          size={size}
          colorScheme="designPurple"
        />
        <ShareButton size={size} />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
