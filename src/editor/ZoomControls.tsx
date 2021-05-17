import { HStack, IconButton, StackProps, ThemeTypings } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import {
  fontSizeStep,
  maximumFontSize,
  minimumFontSize,
  useSettings,
} from "../settings/settings";

interface ZoomControlsProps extends StackProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * Zoom in/out icon button pair.
 */
const ZoomControls = ({ size, ...props }: ZoomControlsProps) => {
  const [settings, setSettings] = useSettings();
  const handleZoomIn = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.min(maximumFontSize, settings.fontSize + fontSizeStep),
    });
  }, [setSettings, settings]);
  const handleZoomOut = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.max(minimumFontSize, settings.fontSize - fontSizeStep),
    });
  }, [setSettings, settings]);
  return (
    <HStack {...props}>
      <IconButton
        size={size}
        isRound
        icon={<RiZoomInLine />}
        aria-label="Zoom in"
        onClick={handleZoomIn}
        colorScheme="gray"
      />
      <IconButton
        size={size}
        isRound
        icon={<RiZoomOutLine />}
        aria-label="Zoom out"
        onClick={handleZoomOut}
        colorScheme="gray"
      />
    </HStack>
  );
};

export default ZoomControls;
