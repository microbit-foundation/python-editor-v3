import {
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { WidgetProps } from "./reactWidgetExtension";
import { EditorView } from "@codemirror/view";
import { openWidgetEffect } from "./openWidgets";

interface MultiMicrobitGridProps {
  selectedPixels: number[][];
  onCloseClick: () => void;
  onPixelChange: (x: number, y: number, brightness: number) => void;
}

const MicrobitMultiplePixelsGrid: React.FC<MultiMicrobitGridProps> = ({
  selectedPixels,
  onCloseClick,
  onPixelChange,
}) => {
  const [currentBrightness, setCurrentBrightness] = useState<number>(5);
  const [selectedPixel, setSelectedPixel] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handlePixelClick = (x: number, y: number) => {
    setSelectedPixel({ x, y });
    onPixelChange(x, y, currentBrightness);
  };

  const handleBrightnessChange = (brightness: number) => {
    setCurrentBrightness(brightness);
    if (selectedPixel) {
      onPixelChange(selectedPixel.x, selectedPixel.y, brightness);
    }
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
          {selectedPixels.map((row, y) => (
            <Box key={y} display="flex">
              {row.map((brightness, x) => (
                <Box key={x} display="flex" mr="2px">
                  <Button
                    size="xs"
                    h="15px"
                    w="15px"
                    p={0}
                    bgColor={`rgba(255, 0, 0, ${brightness / 9})`}
                    _hover={{
                      bgColor:
                        brightness > 0
                          ? `rgba(255, 100, 100, ${selectedPixels[y][x] / 9})`
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                    onClick={() => handlePixelClick(x, y)}
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
          value={currentBrightness}
          min={0}
          max={9}
          step={1}
          orientation="vertical"
          _focus={{ boxShadow: "none" }}
          _active={{ bgColor: "transparent" }}
          onChange={(value) => handleBrightnessChange(value)}
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

export const MicrobitMultiplePixelComponent = ({
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
  const initialSelectedPixels = parseArgs(args);
  const [selectedPixels, setSelectedPixels] = useState<number[][]>(
    initialSelectedPixels
  );

  const handlePixelChange = (x: number, y: number, brightness: number) => {
    const updatedPixels = [...selectedPixels];
    updatedPixels[y][x] = brightness;
    setSelectedPixels(updatedPixels);
    updateView();
  };

  const updateView = () => {
    let insertion = pixelsToString(selectedPixels);
    console.log(insertion);
    view.dispatch({
      changes: {
        from: from,
        to: to,
        insert: insertion,
      },
    });
  };

  const handleCloseClick = () => {
    view.dispatch({
      effects: [openWidgetEffect.of(-1)],
    });
  };

  return (
    <MicrobitMultiplePixelsGrid
      selectedPixels={selectedPixels}
      onPixelChange={handlePixelChange}
      onCloseClick={handleCloseClick}
    />
  );
};

const parseArgs = (args: string[]): number[][] => {
  const defaultPixels = Array.from({ length: 5 }, () => Array(5).fill(0));
  // If args is empty, return a 5x5 array filled with zeros
  if (args.length === 0) {
    return defaultPixels;
  }

  if (args.length !== 1) {
    return defaultPixels;
  }
  const argString = args[0];
  const rows = argString.split(":");

  if (rows.length !== 5) {
    return defaultPixels;
  }

  const numbers: number[][] = [];
  for (let row of rows) {
    row = row.trim();
    if (!/^\d{5}$/.test(row)) {
      return defaultPixels;
    }
    const rowNumbers = row.split("").map(Number);
    numbers.push(rowNumbers);
  }

  return numbers;
};

function pixelsToString(pixels: number[][]): string {
  let outputString = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      outputString += pixels[y][x].toString();
    }
    outputString += ":";
  }
  outputString = outputString.slice(0, -1);
  return outputString;
}
