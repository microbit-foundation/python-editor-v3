import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderThumbProps,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import React, { ForwardedRef, ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";
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
      pb={minimised ? 0 : 2}
      pt={minimised ? 0 : 1}
      spacing={3}
      pr={minimised ? 0 : 2}
      flex="1 1 auto"
    >
      {icon}
      <Slider
        aria-label={title}
        aria-valuetext={valueText}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        colorScheme="blackAlpha"
        onMouseEnter={() => handleMouseOverTooltip(true)}
        onMouseLeave={() => handleMouseOverTooltip(false)}
      >
        <SliderTrack height={2}>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          placement="top"
          label={valueText}
          isOpen={minimised ? showTooltip : false}
        >
          <SliderThumbIgnoreAriaDescribedBy
            aria-hidden="true"
            onFocus={() => handleFocusTooltip(true)}
            onBlur={() => handleFocusTooltip(false)}
          />
        </Tooltip>
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
            <SliderMark value={min} mt="1" fontSize="xs">
              {min}
            </SliderMark>
            <SliderMark
              value={max}
              mt="1"
              ml={`-${max.toString().length}ch`}
              fontSize="xs"
            >
              {max}
            </SliderMark>
            <SliderMark
              value={value}
              textAlign="center"
              mt="-8"
              ml={(-valueText.length * valuePercent) / 100 + "ch"}
              fontSize="xs"
              whiteSpace="nowrap"
            >
              {valueText}
            </SliderMark>
          </>
        )}
      </Slider>
    </HStack>
  );
};

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
  const percentLeft = ((value - min) / (max - min)) * 100 + "%";
  const formattedLabel = intl.formatMessage({ id: label }) + ` ${value}`;
  return (
    <Tooltip hasArrow placement="top" label={formattedLabel}>
      <Box
        aria-label={formattedLabel}
        position="absolute"
        top="3px"
        left={percentLeft}
        bg="brand.200"
        height={2}
        width={2}
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="gray.25"
      />
    </Tooltip>
  );
};

const SliderThumbIgnoreAriaDescribedBy = React.forwardRef(
  (props: SliderThumbProps, ref: ForwardedRef<HTMLDivElement>) => {
    // We ignore it as otherwise screenreaders get the value read out twice.
    const { "aria-describedby": _, ...rest } = props;
    return <SliderThumb ref={ref} {...rest} />;
  }
);

export default RangeSensor;
