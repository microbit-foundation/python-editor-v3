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
    <Box display="flex" flexDirection="row" justifyContent="flex-start">
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={onCloseClick}>
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

const parseArgs = (args: number[]): Pixel | null => {
  if (Array.isArray(args) && args.length === 3) {
    const [x, y, brightness] = args;
    return { x, y, brightness };
  }
  return { x: 1, y: 1, brightness: 1 };
};

export const MicrobitSinglePixelComponent = (
  { args, ranges, literals, from, to }: WidgetProps,
  view: EditorView
) => {
  const selectedPixel = parseArgs(args);

  const handleCloseClick = () => {
    console.log("closed");
  };

  const handleSelectPixel = (pixel: Pixel) => {
    const { x, y, brightness } = pixel;
    console.log("ye" + view.inView);
    console.log(`(${x}, ${y}, ${brightness}) `);
    view.dispatch({
      changes: {
        from: from,
        to: to,
        insert: `(${x}, ${y}, ${brightness}) `,
      },
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
