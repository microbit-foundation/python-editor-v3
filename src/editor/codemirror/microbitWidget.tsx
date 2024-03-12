import { Box, Grid, GridItem, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { useState } from "react";

interface Pixel {
  x: number;
  y: number;
  brightness: number;
}

const MicrobitPixel: React.FC<{ brightness: number; selected: boolean; onClick: () => void }> = ({ brightness, selected, onClick }) => {
  return (
    <Button
      size="sm"
      h="20px"
      w="20px"
      p={0}
      bgColor={selected ? `rgba(255, 0, 0, ${brightness / 9})` : "rgba(0, 0, 0, 1)"}
      _hover={{ bgColor: selected ? `rgba(255, 0, 0, ${brightness / 9})` : "rgba(0, 0, 0, 1)" }}
      onClick={onClick}
      _focus={{ boxShadow: "none" }}
      _active={{ bgColor: selected ? `rgba(255, 0, 0, ${brightness / 9})` : "rgba(0, 0, 0, 1)" }}
    />
  );
};

interface MicrobitGridProps {
  onClickPixel: (pixel: Pixel) => void;
  onSubmit: () => void;
  isVisible: boolean;
}

const MicrobitGrid: React.FC<MicrobitGridProps> = ({ onClickPixel, onSubmit, isVisible }) => {
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
    onSubmit();
  };

  return (
    <Box display={isVisible ? "flex" : "none"} flexDirection="row">
      <Box>
        <Grid templateColumns={`repeat(5, 1fr)`} gap="2px" maxW="110px">
          {[...Array(5)].map((_, x) => (
            <GridItem key={x}>
              <Grid templateColumns={`repeat(1, 1fr)`} gap="2px">
                {[...Array(5)].map((_, y) => (
                  <GridItem key={y}>
                    <MicrobitPixel
                      brightness={selectedPixel?.x === x && selectedPixel.y === y ? brightness : 0}
                      selected={selectedPixel?.x === x && selectedPixel.y === y}
                      onClick={() => handleClickPixel(x, y)}
                    />
                  </GridItem>
                ))}
              </Grid>
            </GridItem>
          ))}
        </Grid>
      </Box>
      {selectedPixel && (
        <Box ml="60px" mt="10px">
          <Slider
            aria-label="brightness"
            defaultValue={brightness}
            min={1}
            max={9}
            step={1}
            onChange={handleSliderChange}
            orientation="vertical"
            _focus={{ boxShadow: "none" }}
            _active={{ bgColor: "transparent" }}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      )}
      {selectedPixel && (
        <Box display="flex" justifyContent="center" ml="10px" mt="100px">
          <Button onClick={handleOkClick} colorScheme="blue" size="sm">
            Looks Good!
          </Button>
        </Box>
      )}
    </Box>
  );
};

export const MicrobitComponent: React.FC = () => {
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleSelectPixel = (pixel: Pixel) => {
    setSelectedPixel(pixel);
  };

  const handleSubmit = () => {
    setIsVisible(false);
    // Implement logic here, change the arguments to the function
    console.log("S");
  };

  return (
    <Box>
      {isVisible && (
        <MicrobitGrid onClickPixel={handleSelectPixel} onSubmit={handleSubmit} isVisible={isVisible} />
      )}
      {selectedPixel && isVisible && (
        <Box mt="4px">
          Selected Pixel: ({selectedPixel.x}, {selectedPixel.y}) - Brightness: {selectedPixel.brightness}
        </Box>
      )}
    </Box>
  );
};
