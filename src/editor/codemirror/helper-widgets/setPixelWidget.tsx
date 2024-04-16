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

  const calculateColor = () => {
    const red = brightness * 25.5;
    return `rgb(${red}, 0, 0)`;
  };

  return (
    <Box // TODO: copy to allow other widgets to access bg and close
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      bg="lightgray"
    >
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={onCloseClick} bg="white">
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
                    borderRadius={0}
                    bgColor={
                      gridX === x && gridY === y
                        ? `rgba(255, 0, 0, ${brightness / 9})`
                        : "rgba(255, 255, 255, 0)"
                    }
                    border={
                      gridX === x && gridY === y
                        ? "2px solid white"
                        : "0.5px solid white"
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
            <SliderFilledTrack bg={calculateColor()} />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Box>
  );
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

  const selectedPixel = parseArgs(args, types);

  const handleCloseClick = () => {
    view.dispatch({
      effects: [openWidgetEffect.of(-1)],
    });
  };

  const handleSelectPixel = (pixel: Pixel) => {
    const { x, y, brightness } = pixel;
    if (ranges.length === 3) {
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
    } else {
      let vals = `${x},${y},${brightness}`;
      view.dispatch({
        changes: [
          {
            from: from + 1,
            to: to - 1,
            insert: vals,
          },
        ],
        effects: [openWidgetEffect.of(vals.length + from + 2)],
      });
    }
  };

  return (
    <MicrobitSinglePixelGrid
      onPixelClick={handleSelectPixel}
      initialPixel={selectedPixel}
      onCloseClick={handleCloseClick}
    />
  );
};

const parseArgs = (args: string[], types: string[]): Pixel => {
  const parsedArgs: number[] = [];
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (types[i] === "Number") {
      parsedArgs.push(parseInt(arg));
    } else {
      parsedArgs.push(0);
    }
  }
  // Replace missing arguments with 0
  while (parsedArgs.length < 3) {
    parsedArgs.push(0);
  }
  return { x: parsedArgs[0], y: parsedArgs[1], brightness: parsedArgs[2] };
};
