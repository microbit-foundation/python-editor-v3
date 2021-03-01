import { HStack, IconButton, StackProps } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { maximumFontSize, minimumFontSize, useSettings } from "../settings";

const ZoomControls = (props: StackProps) => {
  const [settings, setSettings] = useSettings();
  const handleZoomIn = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.min(maximumFontSize, settings.fontSize + 1),
    });
  }, [setSettings, settings]);
  const handleZoomOut = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.max(minimumFontSize, settings.fontSize - 1),
    });
  }, [setSettings, settings]);
  return (
    <HStack as="nav" {...props}>
      <IconButton
        size="lg"
        isRound
        icon={<RiZoomOutLine />}
        aria-label="Zoom out"
        onClick={handleZoomOut}
      />
      <IconButton
        size="lg"
        isRound
        icon={<RiZoomInLine />}
        aria-label="Zoom in"
        onClick={handleZoomIn}
      />
    </HStack>
  );
};

export default ZoomControls;
