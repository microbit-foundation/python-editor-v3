import {
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useState } from "react";
import {
  RangeSensor as RangeSensorType,
  RangeSensorWithThresholds as RangeSensorWithThresholdsType,
} from "./model";

interface RangeSensorProps {
  sensor: RangeSensorType | RangeSensorWithThresholdsType;
  icon: ReactNode;
  onSensorChange: (id: string, value: number) => void;
}

const RangeSensor = ({ icon, sensor, onSensorChange }: RangeSensorProps) => {
  let lowThreshold;
  let highThreshold;
  if (
    sensor.hasOwnProperty("lowThreshold") &&
    sensor.hasOwnProperty("highThreshold")
  ) {
    lowThreshold = (sensor as RangeSensorWithThresholdsType).lowThreshold;
    highThreshold = (sensor as RangeSensorWithThresholdsType).highThreshold;
  }
  const { id, min, max, value, unit } = sensor;
  const handleChange = useCallback(
    (value: number) => {
      onSensorChange(id, value);
    },
    [onSensorChange, id]
  );
  const valueText = unit ? `${value} ${unit}` : value.toString();
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <HStack pb={2} pt={1} spacing={3}>
      {icon}
      <Slider
        aria-label={id}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        my={5}
        colorScheme="blackAlpha"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderTrack height={2}>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
        {typeof lowThreshold !== "undefined" && (
          <ThresholdMark
            value={lowThreshold}
            label={getThresholdLabels(id, "low")}
            showTooltip={showTooltip}
          />
        )}
        {typeof highThreshold !== "undefined" && (
          <ThresholdMark
            value={highThreshold}
            label={getThresholdLabels(id, "high")}
            showTooltip={showTooltip}
          />
        )}
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
          ml={-valueText.length / 2 + "ch"}
          fontSize="xs"
        >
          {valueText}
        </SliderMark>
      </Slider>
    </HStack>
  );
};

const getThresholdLabels = (id: string, threshold: "low" | "high") => {
  switch (id) {
    case "soundLevel":
      if (threshold === "low") {
        return "Quiet";
      } else {
        return "Loud";
      }
    default:
      return "";
  }
};

interface ThresholdMarkProps {
  value: number;
  label: string;
  showTooltip: boolean;
}

const ThresholdMark = ({ value, label, showTooltip }: ThresholdMarkProps) => {
  return (
    <Tooltip hasArrow placement="top" label={label} isOpen={showTooltip}>
      <SliderMark
        value={value}
        bg="brand.200"
        height={2}
        width={2}
        top="3px"
        borderRight="1px solid"
        borderLeft="1px solid"
        borderColor="gray.25"
      ></SliderMark>
    </Tooltip>
  );
};

export default RangeSensor;
