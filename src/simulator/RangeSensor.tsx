import { Icon } from "@chakra-ui/icons";
import {
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiQuestionFill } from "react-icons/ri";
import { Sensor, sensorIcons } from "./model";

interface RangeSensorProps {
  value: Sensor;
  onSensorChange: (id: string, value: number) => void;
}

const RangeSensor = ({
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
    <HStack pt={5} pb={2}>
      <Icon
        as={sensorIcons[id] || RiQuestionFill}
        aria-label={id}
        color="blimpTeal.400"
        boxSize="6"
      />
      <Slider
        aria-label={id}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        my={5}
      >
        <SliderTrack>
          <SliderFilledTrack bgColor="blimpTeal.600" />
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
