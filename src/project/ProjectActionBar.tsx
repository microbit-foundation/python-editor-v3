import { BoxProps, HStack } from "@chakra-ui/react";
import ConnectDisconnectButton from "./ConnectDisconnectButton";
import DownloadFlashButton from "./DownloadFlashButton";
import LoadButton from "./LoadButton";
import ShareButton from "./ShareButton";

const ProjectActionBar = (props: BoxProps) => {
  const size = "lg";
  return (
    <HStack paddingLeft="24px" {...props} justifyContent="space-between">
      <HStack paddingTop="10px" paddingBottom="10px">
        <DownloadFlashButton size={size} />
      </HStack>
      <HStack paddingRight="24px" spacing="20px">
        <ConnectDisconnectButton />
        <LoadButton mode="button" size={size} />
        <ShareButton variant="outline" size={size} />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
