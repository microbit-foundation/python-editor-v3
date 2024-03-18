import { Box, Grid, GridItem, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { useState } from "react";
import {
    EditorView,
  } from "@codemirror/view";

interface Pixel {
  x: number;
  y: number;
  brightness: number;
}

interface MicrobitSinglePixelGridProps {
  onClickPixel: (pixel: Pixel) => void;
  onSubmit: (x:number, y:number, brightness:number) => void;
  isVisible: boolean;
}

const MicrobitSinglePixelGrid: React.FC<MicrobitSinglePixelGridProps> = ({ onClickPixel, onSubmit, isVisible }) => {
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

  const handleOkClick = () => {
    if (selectedPixel) {
      onSubmit(selectedPixel.x, selectedPixel.y, selectedPixel.brightness);
    }
  };
  
  return (
  <>
    {selectedPixel && (
      <Box mt="4px">
        <span style={{ fontSize: "small" }}>
          Selected Pixel: ({selectedPixel.x}, {selectedPixel.y}) | Brightness: {selectedPixel.brightness}
        </span>
      </Box>
    )}
    <Box display={isVisible ? "flex" : "none"} flexDirection="row" justifyContent="flex-start">
      <Box>
        <Box bg="black" p="10px" borderRadius="5px">
          {[...Array(5)].map((_, x) => (
            <Box key={x} display="flex">
              {[...Array(5)].map((_, y) => (
                <Box key={y} display="flex" mr="2px">
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
        {selectedPixel && (
          <Box display="flex" flexDirection="column" alignItems="center" mt="10px">
            <Box bg="white" borderRadius="5px" p="5px" textAlign="center">
              <Button onClick={() => onSubmit(selectedPixel?.x ?? 0, selectedPixel?.y ?? 0, selectedPixel?.brightness ?? 0)} colorScheme="blue" size="sm">
                Looks Good
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      {selectedPixel && (
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
            onChange={handleSliderChange}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      )}
    </Box>
  </>
);

};

export const MicrobitSinglePixelComponent = ({ from, to, view }: { from: number, to: number, view: EditorView }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);

  const handleSelectPixel = (pixel: Pixel) => {
    setSelectedPixel(pixel);
  };

  const handleSubmit = (x: number, y: number, brightness: number) => {
    setIsVisible(false);      
    view.dispatch({
      changes: {
        from: from,
        to: to,
        insert: (`(${x}, ${y}, ${brightness}) `),
      }
    });
  };

  return (
        <MicrobitSinglePixelGrid onClickPixel={handleSelectPixel} onSubmit={handleSubmit} isVisible={isVisible} />
  );
};

interface MultiMicrobitGridProps {
  selectedPixels: Pixel[];
  onPixelClick: (x: number, y: number) => void;
  onBrightnessChange: (x: number, y: number, brightness: number) => void;
  onSubmit: () => void;
  isVisible: boolean;
}

const MicrobitMultiplePixelsGrid: React.FC<MultiMicrobitGridProps> = ({
  selectedPixels,
  onPixelClick,
  onBrightnessChange,
  onSubmit,
  isVisible,
}) => {
  return (
    <Box display={isVisible ? "flex" : "none"} flexDirection="row" justifyContent="flex-start">
      <Box>
        <Box bg="black" p="10px" borderRadius="5px">
          {[...Array(5)].map((_, x) => (
            <Box key={x} display="flex">
              {[...Array(5)].map((_, y) => (
                <Box key={y} display="flex" mr="2px">
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
        <Box display="flex" justifyContent="center" mt="10px">
          <Box bg="white" borderRadius="5px" p="5px">
            <Button onClick={onSubmit} colorScheme="blue" size="sm">
              Looks Good
            </Button>
          </Box>
        </Box>
      </Box>
      <Box ml="10px">
        <Slider
          aria-label="brightness"
          defaultValue={5}
          min={0}
          max={9}
          step={1}
          orientation="vertical"
          _focus={{ boxShadow: "none" }}
          _active={{ bgColor: "transparent" }}
          onChange={(value) => onBrightnessChange(selectedPixels[selectedPixels.length - 1].x, selectedPixels[selectedPixels.length - 1].y, value)}
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
  from,
  to,
  view,
}: {
  from: number;
  to: number;
  view: EditorView;
}) => {
  const initialSelectedPixels: Pixel[] = [];
  
  for (let x = from; x <= to; x++) {
    for (let y = from; y <= to; y++) {
      initialSelectedPixels.push({ x, y, brightness: 0 });
    }
  }

  const [selectedPixels, setSelectedPixels] = useState<Pixel[]>(initialSelectedPixels);
  const [isVisible, setIsVisible] = useState(true);

  const handlePixelClick = (x: number, y: number) => {
    const existingIndex = selectedPixels.findIndex(pixel => pixel.x === x && pixel.y === y);
    const brightness = selectedPixels[selectedPixels.length - 1]?.brightness ?? 5;

    if (existingIndex !== -1) {
      const updatedPixels = [...selectedPixels];
      updatedPixels[existingIndex].brightness = brightness;
      setSelectedPixels(updatedPixels);
    } else {
      const newPixel: Pixel = { x, y, brightness };
      setSelectedPixels([...selectedPixels, newPixel]);
    }
  };

  const handleSubmit = () => {
    setIsVisible(false);
  };

  const handleBrightnessChange = (x: number, y: number, brightness: number) => {
    setSelectedPixels(prevPixels => {
      const updatedPixels = [...prevPixels];
      const pixelIndex = updatedPixels.findIndex(pixel => pixel.x === x && pixel.y === y);
      if (pixelIndex !== -1) {
        updatedPixels[pixelIndex] = { x, y, brightness };
      }
      return updatedPixels;
    });
  };

  return (
    <MicrobitMultiplePixelsGrid
      selectedPixels={selectedPixels}
      onPixelClick={handlePixelClick}
      onBrightnessChange={handleBrightnessChange}
      onSubmit={handleSubmit}
      isVisible={isVisible}
    />
  );
};