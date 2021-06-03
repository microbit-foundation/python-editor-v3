import {
  ButtonGroup,
  IconButton,
  StackProps,
  ThemeTypings,
} from "@chakra-ui/react";
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
    <ButtonGroup
      {...props}
      isAttached
      colorScheme="gray"
      variant="zoom"
      transform="rotate(90deg)"
      transformOrigin="bottom"
    >
      <IconButton
        size={size}
        isRound
        icon={<RiZoomInLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label="Zoom in"
        onClick={handleZoomIn}
      />
      <IconButton
        size={size}
        isRound
        borderLeft="1px"
        borderLeftColor="gray.10"
        icon={<RiZoomOutLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label="Zoom out"
        onClick={handleZoomOut}
      />
    </ButtonGroup>
  );
};

export default ZoomControls;
