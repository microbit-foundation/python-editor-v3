import React from "react";
import {
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { EditorView } from "@codemirror/view";
import { WidgetProps } from "./reactWidgetExtension";
import { openWidgetEffect } from "./openWidgets";

interface Pixel {
  x: number;
  y: number;
  brightness: number;
}

interface MicrobitSinglePixelGridProps {
  onPixelClick: (pixel: Pixel) => void;
  initialPixel: Pixel | null;
  onCloseClick: () => void;
}

const MicrobitSinglePixelGrid: React.FC<MicrobitSinglePixelGridProps> = ({
  onPixelClick,
  initialPixel,
  onCloseClick,
}) => {
  const { x, y, brightness } = initialPixel ?? { x: 0, y: 0, brightness: 9 };
  const handlePixelClick = (x: number, y: number) => {
    const newPixel: Pixel = { x, y, brightness };
    onPixelClick(newPixel);
  };
  const handleSliderChange = (value: number) => {
    const updatedPixel: Pixel = { x, y, brightness: value };
    onPixelClick(updatedPixel);
  };

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-start" bg = "lightgray">
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={onCloseClick} bg = "white">
          X
        </Button>
      </Box>
      <Box>
        <Box
          bg="black"
          p="10px"
          borderRadius="5px"
          style={{ marginTop: "15px" }}
        >
          {[...Array(5)].map((_, gridY) => (
            <Box key={y} display="flex">
              {[...Array(5)].map((_, gridX) => (
                <Box key={x} display="flex" mr="2px">
                  <Button
                    size="xs"
                    h="15px"
                    w="15px"
                    p={0}
                    bgColor={
                      gridX === x && gridY === y
                        ? `rgba(255, 0, 0, ${brightness / 9})`
                        : "rgba(255, 255, 255, 0)"
                    }
                    _hover={{
                      bgColor:
                        gridX === x && gridY === y
                          ? `rgba(255, 0, 0, ${brightness / 9})`
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                    onClick={() => handlePixelClick(gridX, gridY)}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Box ml="10px" style={{ marginTop: "15px" }}>
        <Slider
          aria-label="brightness"
          defaultValue={brightness}
          min={0}
          max={9}
          step={1}
          orientation="vertical"
          _focus={{ boxShadow: "none" }}
          _active={{ bgColor: "transparent" }}
          onChange={handleSliderChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Box>
  );
};

const parseArgs = (args: string[], types: string[]): Pixel | null => {
  if (args.length > 3) {
    return null;
  }
  const parsedArgs: number[] = [];
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (types[i] === "Number") {
      parsedArgs.push(parseInt(arg));
    } else if (arg === ",") {
      parsedArgs.push(0);
    } else {
      return null;
    }
  }
  while (parsedArgs.length < 3) {
    parsedArgs.push(0);
  }
  return { x: parsedArgs[0], y: parsedArgs[1], brightness: parsedArgs[2] };
};

export const MicrobitSinglePixelComponent = ({
  props,
  view,
}: {
  props: WidgetProps;
  view: EditorView;
}) => {
  let args = props.args;
  let ranges = props.ranges;
  let types = props.types;
  let from = props.from;
  let to = props.to;
  console.log(args);
  console.log(types);
  const selectedPixel = parseArgs(args, types);

  if (selectedPixel == null) {
  }

  const handleCloseClick = () => {
    view.dispatch({
      effects: [openWidgetEffect.of(-1)],
    });
  };

  const handleSelectPixel = (pixel: Pixel) => {
    const { x, y, brightness } = pixel;
    view.dispatch({
      changes: [
        {
          from: ranges[0].from,
          to: ranges[0].to,
          insert: `${x}`,
        },
        {
          from: ranges[1].from,
          to: ranges[1].to,
          insert: `${y}`,
        },
        {
          from: ranges[2].from,
          to: ranges[2].to,
          insert: `${brightness}`,
        },
      ],
      effects: [openWidgetEffect.of(to)],
    });
  };

  return (
    <MicrobitSinglePixelGrid
      onPixelClick={handleSelectPixel}
      initialPixel={selectedPixel}
      onCloseClick={handleCloseClick}
    />
  );
};
