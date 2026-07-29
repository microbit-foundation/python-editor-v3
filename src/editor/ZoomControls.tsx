/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton } from "@microbit/ui";
import { useCallback } from "react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SystemStyleObject } from "styled-system/types";
import { useLogging } from "../logging/logging-hooks";
import {
  fontSizeStep,
  maximumFontSize,
  minimumFontSize,
  useSettings,
} from "../settings/settings";

interface ZoomControlsProps {
  size?: "lg" | "md" | "sm" | "xs";
  css?: SystemStyleObject;
}

/**
 * Zoom in/out icon button pair.
 */
const ZoomControls = ({ size, css: cssProp }: ZoomControlsProps) => {
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
    <ButtonGroup css={cssProp} isAttached>
      <IconButton
        size={size}
        isRound
        variant="zoom"
        aria-label={intl.formatMessage({ id: "zoom-out-action" })}
        onPress={handleZoomOut}
      >
        <RiZoomOutLine />
      </IconButton>
      <IconButton
        css={{ borderLeft: "1px solid", borderLeftColor: "gray.10" }}
        size={size}
        isRound
        variant="zoom"
        aria-label={intl.formatMessage({ id: "zoom-in-action" })}
        onPress={handleZoomIn}
      >
        <RiZoomInLine />
      </IconButton>
    </ButtonGroup>
  );
};

export default ZoomControls;
