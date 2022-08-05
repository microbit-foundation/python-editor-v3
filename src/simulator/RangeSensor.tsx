import {
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { RangeSensor as RangeSensorType } from "./model";

interface RangeSensorProps {
  value: RangeSensorType;
  icon: ReactNode;
  onSensorChange: (id: string, value: number) => void;
}

const RangeSensor = ({
  icon,
  value: { id, min, max, value, unit },
  onSensorChange,
}: RangeSensorProps) => {
  const handleChange = useCallback(
    (value: number) => {
      onSensorChange(id, value);
    },
    [onSensorChange, id]
  );
  const valueText = unit ? `${value} ${unit}` : value.toString();
  return (
    <HStack pb={2} pt={1}>
      {icon}
      <Slider
        aria-label={id}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        my={5}
        colorScheme="blackAlpha"
      >
        <SliderTrack height={2}>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
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

export default RangeSensor;
