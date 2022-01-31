/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
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
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useLogging } from "../logging/logging-hooks";
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
  const logging = useLogging();
  const [settings, setSettings] = useSettings();
  const handleZoomIn = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.min(maximumFontSize, settings.fontSize + fontSizeStep),
    });
    logging.event({ type: "zoom-in" });
  }, [setSettings, settings, logging]);
  const handleZoomOut = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.max(minimumFontSize, settings.fontSize - fontSizeStep),
    });
    logging.event({ type: "zoom-out" });
  }, [setSettings, settings, logging]);
  const intl = useIntl();
  return (
    <ButtonGroup {...props} isAttached colorScheme="gray" variant="zoom">
      <IconButton
        size={size}
        isRound
        icon={<RiZoomOutLine />}
        aria-label={intl.formatMessage({ id: "zoom-out-action" })}
        onClick={handleZoomOut}
      />
      <IconButton
        borderLeft="1px"
        borderLeftColor="gray.10"
        size={size}
        isRound
        icon={<RiZoomInLine />}
        aria-label={intl.formatMessage({ id: "zoom-in-action" })}
        onClick={handleZoomIn}
      />
    </ButtonGroup>
  );
};

export default ZoomControls;
