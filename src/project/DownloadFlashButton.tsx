import {
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiDownload2Line, RiFlashlightFill } from "react-icons/ri";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";
import { useProjectActions } from "./project-hooks";

interface DownloadFlashButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
const DownloadFlashButton = ({ size }: DownloadFlashButtonProps) => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const buttonWidth = "10rem"; // 8.1 with md buttons
  return (
    <HStack>
      <HStack>
        <Menu>
          <ButtonGroup isAttached>
            {connected ? (
              <FlashButton width={buttonWidth} mode={"button"} size={size} />
            ) : (
              <DownloadButton width={buttonWidth} mode={"button"} size={size} />
            )}
            <MenuButton
              borderLeft="1px"
              borderRadius="4xl"
              as={IconButton}
              // Shift to compensate for border radius on the right
              icon={<MdMoreVert style={{ marginLeft: "-0.3rem" }} />}
              size={size}
              colorScheme="blimpPurple"
            />
            <Portal>
              {/* z-index above the xterm.js's layers */}
              <MenuList zIndex={4}>
                {!connected && (
                  <MenuItem
                    target="_blank"
                    rel="noopener"
                    icon={<RiFlashlightFill />}
                    onClick={actions.flash}
                  >
                    Flash
                  </MenuItem>
                )}
                {connected && (
                  <MenuItem
                    target="_blank"
                    rel="noopener"
                    icon={<RiDownload2Line />}
                    onClick={actions.download}
                  >
                    Download project hex
                  </MenuItem>
                )}
                <MenuItem
                  target="_blank"
                  rel="noopener"
                  icon={<RiDownload2Line />}
                  onClick={actions.downloadMainFile}
                >
                  Download Python script
                </MenuItem>
              </MenuList>
            </Portal>
          </ButtonGroup>
        </Menu>
      </HStack>
    </HStack>
  );
};

export default DownloadFlashButton;
