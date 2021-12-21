/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ButtonGroup,
  IconButton,
  StackProps,
  ThemeTypings,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiAddLine, RiSubtractLine } from "react-icons/ri";
import { useIntl } from "react-intl";
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
  const intl = useIntl();
  return (
    <ButtonGroup {...props} colorScheme="gray" variant="ghost">
      <IconButton
        size={size}
        isRound
        opacity={0.8}
        icon={<RiSubtractLine size="20px" />}
        aria-label={intl.formatMessage({ id: "zoom-out-action" })}
        onClick={handleZoomOut}
      />
      <IconButton
        size={size}
        isRound
        opacity={0.8}
        icon={<RiAddLine size="20px" />}
        aria-label={intl.formatMessage({ id: "zoom-in-action" })}
        onClick={handleZoomIn}
      />
    </ButtonGroup>
  );
};

export default ZoomControls;
