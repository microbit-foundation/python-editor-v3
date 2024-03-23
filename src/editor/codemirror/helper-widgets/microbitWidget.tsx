import { Box, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { useState } from "react";
import {WidgetProps} from "./reactWidgetExtension";

interface Pixel {
  x: number;
  y: number;
  brightness: number;
}

interface MicrobitSinglePixelGridProps {
  onClickPixel: (pixel: Pixel) => void;
}

const MicrobitSinglePixelGrid: React.FC<MicrobitSinglePixelGridProps> = ({ onClickPixel }) => {
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [brightness, setBrightness] = useState<number>(5);

  const handleClickPixel = (x: number, y: number) => {
    const newPixel: Pixel = { x, y, brightness };
    setSelectedPixel(newPixel);
    onClickPixel(newPixel);
  };

  const handleSliderChange = (value: number) => {
    if (selectedPixel) {
      setBrightness(value);
      const updatedPixel: Pixel = { ...selectedPixel, brightness: value };
      onClickPixel(updatedPixel);
    }
  };

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-start">
      <Box>
        <Box bg="black" p="10px" borderRadius="5px">
          {[...Array(5)].map((_, y) => (
            <Box key={y} display="flex">
              {[...Array(5)].map((_, x) => (
                <Box key={x} display="flex" mr="2px">
                  <Button
                    size="xs"
                    h="15px"
                    w="15px"
                    p={0}
                    bgColor={selectedPixel?.x === x && selectedPixel.y === y ? `rgba(255, 0, 0, ${brightness / 9})` : "rgba(255, 255, 255, 0)"}
                    _hover={{ bgColor: selectedPixel?.x === x && selectedPixel.y === y ? `rgba(255, 0, 0, ${brightness / 9})` : "rgba(255, 255, 255, 0.5)" }}
                    onClick={() => handleClickPixel(x, y)}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Box ml="10px">
        <Slider
          aria-label="brightness"
          defaultValue={brightness}
          min={0}
          max={9}
          step={1}
          orientation="vertical"
          _focus={{ boxShadow: "none" }}
          _active={{ bgColor: "transparent" }}
          onChange={handleSliderChange}>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Box>
  );
};

export const MicrobitSinglePixelComponent = ({ args, from, to, view }: WidgetProps<number>) => {
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  if (Array.isArray(args) && args.length === 3) {
    const [x, y, brightness] = args;
    setSelectedPixel({ x, y, brightness });
  }

  const handleSelectPixel = (pixel: Pixel) => {
    setSelectedPixel(pixel);
    if (selectedPixel !== null) {
      const { x, y, brightness } = selectedPixel;
      view.dispatch({
        changes: {
          from: from,
          to: to,
          insert: `(${x}, ${y}, ${brightness}) `,
        }
      });
    }
  };

  return (<MicrobitSinglePixelGrid onClickPixel={handleSelectPixel} />);
};


interface MultiMicrobitGridProps {
  selectedPixels: Pixel[];
  onPixelClick: (x: number, y: number) => void;
  onBrightnessChange: (x: number, y: number, brightness: number) => void;
  onSubmit: () => void;
  currentBrightness: number;
}

const MicrobitMultiplePixelsGrid: React.FC<MultiMicrobitGridProps> = ({
  selectedPixels,
  onPixelClick,
  onBrightnessChange,
  currentBrightness
}) => {
  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-start">
      <Box>
        <Box bg="black" p="10px" borderRadius="5px">
          {[...Array(5)].map((_, y) => (
            <Box key={y} display="flex">
              {[...Array(5)].map((_, x) => (
                <Box key={x} display="flex" mr="2px">
                  <Button
                    size="xs"
                    h="15px"
                    w="15px"
                    p={0}
                    bgColor={selectedPixels.some(p => p.x === x && p.y === y) ? `rgba(255, 0, 0, ${(selectedPixels.find(p => p.x === x && p.y === y)!.brightness) / 9})` : "rgba(255, 255, 255, 0)"}
                    _hover={{ bgColor: selectedPixels.some(p => p.x === x && p.y === y) ? `rgba(255, 0, 0, ${(selectedPixels.find(p => p.x === x && p.y === y)!.brightness) / 9})` : "rgba(255, 255, 255, 0.5)" }}
                    onClick={() => onPixelClick(x, y)}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Box ml="10px">
        <Slider
          aria-label="brightness"
          value={currentBrightness}
          min={0}
          max={9}
          step={1}
          orientation="vertical"
          _focus={{ boxShadow: "none" }}
          _active={{ bgColor: "transparent" }}
          onChange={(value) => {
            const lastPixel = selectedPixels.length > 0 ? selectedPixels[selectedPixels.length - 1] : { x: -1, y: -1 };
            onBrightnessChange(lastPixel.x, lastPixel.y, value);
          }}        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Box>
  );
};

export const MicrobitMultiplePixelComponent = ({args, from, to, view }: WidgetProps<number>) => {
  const initialSelectedPixels: Pixel[] = [];

  const [selectedPixels, setSelectedPixels] = useState<Pixel[]>(initialSelectedPixels);
  const [currentBrightness, setCurrentBrightness] = useState(5);

  const handlePixelClick = (x: number, y: number) => {
    const existingIndex = selectedPixels.findIndex(pixel => pixel.x === x && pixel.y === y);
    if (existingIndex !== -1) {
      const updatedPixels = [...selectedPixels];
      updatedPixels[existingIndex].brightness = currentBrightness;
      setSelectedPixels(updatedPixels);
    } else {
      const newPixel: Pixel = { x, y, brightness: currentBrightness };
      setSelectedPixels([...selectedPixels, newPixel]);
    }
    handleSubmit();
  };

  const handleBrightnessChange = (x: number, y: number, brightness: number) => {
    setCurrentBrightness(brightness);
    setSelectedPixels(prevPixels => {
      const updatedPixels = [...prevPixels];
      const pixelIndex = updatedPixels.findIndex(pixel => pixel.x === x && pixel.y === y);
      if (pixelIndex !== -1) {
        updatedPixels[pixelIndex].brightness = brightness;
      }
      return updatedPixels;
    });
    handleSubmit();
  };

  const handleSubmit = () => {
    console.log("Submitting...");
  };

  return (
    <MicrobitMultiplePixelsGrid
      selectedPixels={selectedPixels}
      onPixelClick={handlePixelClick}
      onBrightnessChange={handleBrightnessChange}
      onSubmit={handleSubmit}
      currentBrightness={currentBrightness}
    />
  );
};