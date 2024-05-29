/* eslint-disable */
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

  const calculateColor = () => {
    const red = currentBrightness * 25.5;
    return `rgb(${red}, 0, 0)`;
  };

  return (
    <div>
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={onCloseClick} bg="white">
          X
        </Button>
      </Box>
      <Box // TODO: copy to allow other widgets to access bg and close
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        width="250px"
        background="snow"
        border="1px solid lightgray"
        boxShadow="0 0 10px 5px rgba(173, 216, 230, 0.7)"
      >
        <Box>
          <Box
            bg="white"
            p="10px"
            borderRadius="0px"
            border="1px solid black"
            style={{
              marginLeft: "15px",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            {[...Array(5)].map((_, gridY) => (
              <Box key={gridY} display="flex">
                {[...Array(5)].map((_, gridX) => (
                  <Box key={gridX} display="flex" mr="0px">
                    <Button
                      height="32px"
                      width="30px"
                      p={0}
                      borderRadius={0}
                      bgColor={`rgba(255, 0, 0, ${
                        selectedPixels[gridY][gridX] / 9
                      })`}
                      border={
                        selectedPixel?.x === gridX && selectedPixel.y === gridY
                          ? "2px solid white"
                          : "0.5px solid white"
                      }
                      _hover={{
                        bgColor:
                          currentBrightness > 0
                            ? `rgba(255, 100, 100, ${
                                selectedPixels[gridY][gridX] / 9
                              })`
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
            defaultValue={currentBrightness}
            min={0}
            max={9}
            step={1}
            height="182px"
            orientation="vertical"
            _focus={{ boxShadow: "none" }}
            _active={{ bgColor: "transparent" }}
            onChange={(value) => handleBrightnessChange(value)}
          >
            <SliderTrack>
              <SliderFilledTrack bg={calculateColor()} />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </Box>
    </div>
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
    if (ranges.length === 1) {
      view.dispatch({
        changes: {
          from: ranges[0].from,
          to: ranges[0].to,
          insert: insertion,
        },
        effects: [openWidgetEffect.of(insertion.length + from + 2)],
      });
    } else {
      view.dispatch({
        changes: [
          {
            from: from + 1,
            to: to - 1,
            insert: insertion,
          },
        ],
        effects: [openWidgetEffect.of(insertion.length + from + 2)],
      });
    }
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
  const argString = args[0].replace(/"/g, "");
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
  let outputString = '"';
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      outputString += pixels[y][x].toString();
    }
    outputString += ":";
  }
  outputString = outputString.slice(0, -1);
  outputString += '"';
  return outputString;
}
