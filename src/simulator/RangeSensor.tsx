import { Slider, Tooltip } from "@microbit/ui";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
} from "../device/simulator";

interface RangeSensorProps {
  id: SensorStateKey;
  sensor: RangeSensorType;
  title: string;
  icon?: ReactNode;
  onSensorChange: (id: SensorStateKey, value: number) => void;
  minimised?: boolean;
}

const RangeSensor = ({
  id,
  icon,
  sensor,
  title,
  onSensorChange,
  minimised = false,
}: RangeSensorProps) => {
  const { min, max, value, unit, lowThreshold, highThreshold } = sensor;
  const handleChange = useCallback(
    (value: number) => {
      onSensorChange(id, value);
    },
    [onSensorChange, id]
  );
  const valueText = unit ? `${value} ${unit}` : value.toString();
  const intl = useIntl();
  // The unit goes in the accessible name (announced once, on focus) rather
  // than per-value announcements: react-aria has no aria-valuetext
  // passthrough and Intl's sanctioned unit list can't express mg/nT anyway.
  // Translated so screen readers say "milli-g", not a guess at "mg".
  const unitMessageIds: Record<string, string> = {
    mg: "simulator-unit-milli-g",
    nT: "simulator-unit-nanotesla",
    "°C": "simulator-unit-celsius",
    deg: "simulator-unit-degrees",
  };
  const unitName = unit
    ? unitMessageIds[unit]
      ? intl.formatMessage({ id: unitMessageIds[unit] })
      : unit
    : undefined;
  const accessibleTitle = unitName ? `${title} (${unitName})` : title;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const handleFocusTooltip = useCallback((value: boolean) => {
    setIsFocused(value);
    setShowTooltip(value);
  }, []);
  const handleMouseOverTooltip = useCallback(
    (value: boolean) => {
      if (!isFocused) {
        setShowTooltip(value);
      }
    },
    [isFocused]
  );
  const valuePercent = ((value - min) / (max - min)) * 100;
  return (
    <HStack
      pb={minimised ? "0" : "2"}
      pt={minimised ? "0" : "1"}
      gap="3"
      pr={minimised ? "0" : "2"}
      flex="1 1 auto"
      onMouseEnter={() => handleMouseOverTooltip(true)}
      onMouseLeave={() => handleMouseOverTooltip(false)}
    >
      {icon}
      <Slider
        aria-label={accessibleTitle}
        value={value}
        minValue={min}
        maxValue={max}
        onChange={handleChange}
        trackCss={{ height: "2" }}
        // Chakra colorScheme="blackAlpha" filled track.
        filledTrackCss={{ bg: "blackAlpha.500" }}
        thumbTooltip={valueText}
        isThumbTooltipOpen={minimised ? showTooltip : false}
        onThumbFocusChange={handleFocusTooltip}
      >
        {typeof lowThreshold !== "undefined" && (
          <ThresholdMark
            value={lowThreshold}
            label={getThresholdLabels(id, "low")}
            min={min}
            max={max}
          />
        )}
        {typeof highThreshold !== "undefined" && (
          <ThresholdMark
            value={highThreshold}
            label={getThresholdLabels(id, "high")}
            min={min}
            max={max}
          />
        )}
        {!minimised && (
          <>
            <SensorMark percent={0}>{min}</SensorMark>
            <SensorMark
              percent={100}
              style={{ marginLeft: `-${max.toString().length}ch` }}
            >
              {max}
            </SensorMark>
            <SensorMark
              percent={valuePercent}
              css={{ textAlign: "center", mt: "-8", whiteSpace: "nowrap" }}
              style={{
                marginLeft: (-valueText.length * valuePercent) / 100 + "ch",
              }}
            >
              {valueText}
            </SensorMark>
          </>
        )}
      </Slider>
    </HStack>
  );
};

/**
 * An always-visible equivalent of Chakra's SliderMark: absolutely
 * positioned at a percentage along the track, below it by default.
 */
const SensorMark = ({
  percent,
  css: cssProp,
  style,
  children,
}: {
  percent: number;
  css?: Parameters<typeof css>[0];
  style?: React.CSSProperties;
  children: ReactNode;
}) => (
  <div
    className={css({ position: "absolute", mt: "1", fontSize: "xs" }, cssProp)}
    // Track position is a runtime value.
    style={{ left: `${percent}%`, ...style }}
  >
    {children}
  </div>
);

const getThresholdLabels = (id: string, threshold: "low" | "high") => {
  switch (id) {
    case "soundLevel":
      if (threshold === "low") {
        return "simulator-quiet";
      } else {
        return "simulator-loud";
      }
    default:
      return "";
  }
};

interface ThresholdMarkProps {
  value: number;
  label: string;
  min: number;
  max: number;
}

const ThresholdMark = ({ value, label, min, max }: ThresholdMarkProps) => {
  const intl = useIntl();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const percentLeft = ((value - min) / (max - min)) * 100 + "%";
  const formattedLabel = intl.formatMessage({ id: label }) + ` ${value}`;
  return (
    <>
      <Box
        ref={ref}
        aria-label={formattedLabel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        position="absolute"
        top="3px"
        bg="brand.200"
        height="2"
        width="2"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="gray.75"
        // Track position is a runtime value.
        style={{ left: percentLeft }}
      />
      {/* The marker is not focusable (as before), so the tooltip is
          hover-driven via the library's triggerRef escape hatch. */}
      <Tooltip
        hasArrow
        placement="top"
        label={formattedLabel}
        isOpen={hovered}
        triggerRef={ref}
      >
        <span />
      </Tooltip>
    </>
  );
};

export default RangeSensor;
