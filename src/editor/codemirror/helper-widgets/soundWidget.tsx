import React, { useState } from "react";
import {
  Box,
  Button,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
} from "@chakra-ui/react";
import { EditorView } from "@codemirror/view";
import { WidgetProps } from "./reactWidgetExtension";
import { openWidgetEffect } from "./openWidgets";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
  sliderStyle?: React.CSSProperties;
  label: string;
}

const DurationSliderProps: SliderProps = {
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  onChange: (value) => {
    console.log("Slider value changed:", value);
  },
  sliderStyle: {
    width: "100%", // Adjust the width of the slider
    height: "100px", // Adjust the height of the slider
    backgroundColor: "lightgray", // Change the background color of the slider
    borderRadius: "10px", // Apply rounded corners to the slider track
    border: "none", // Remove the border of the slider track
    outline: "none", // Remove the outline when focused
  },
  label: "Duration",
};

const endSliderProps: SliderProps = {
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  onChange: (value) => {
    console.log("Slider value changed:", value);
  },
  sliderStyle: {
    width: "100%", // Adjust the width of the slider
    height: "100px", // Adjust the height of the slider
    backgroundColor: "lightgray", // Change the background color of the slider
    borderRadius: "10px", // Apply rounded corners to the slider track
    border: "none", // Remove the border of the slider track
    outline: "none", // Remove the outline when focused
  },
  label: "End Freq",
};

const startSliderProps: SliderProps = {
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  onChange: (value) => {
    console.log("Slider value changed:", value);
  },
  sliderStyle: {
    width: "200%", // Adjust the width of the slider
    height: "100px", // Adjust the height of the slider
    backgroundColor: "lightgray", // Change the background color of the slider
    borderRadius: "10px", // Apply rounded corners to the slider track
    border: "none", // Remove the border of the slider track
    outline: "none", // Remove the outline when focused
  },
  label: "Start Freq",
};

const customSliderStyle: React.CSSProperties = {
  width: "80%", // Adjust the width of the slider
  height: "20px", // Adjust the height of the slider
};

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step,
  defaultValue,
  onChange,
  sliderStyle,
  label,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "left" }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <label style={{ fontSize: "16px" }}>
        {label}: {value}
      </label>
    </div>
  );
};

const TripleSliderWidget: React.FC<{
  slider1Props: SliderProps;
  slider2Props: SliderProps;
  slider3Props: SliderProps;
  isOpen: boolean;
}> = ({ slider1Props, slider2Props, slider3Props, isOpen }) => {

  const [waveHeight, setWaveHeight] = useState(50);
  const [waveLength, setWaveLength] = useState(50);

  const handleSlider1Change = (value: number) => {
    slider1Props.onChange(value);
    setWaveHeight(value);
  };

  const handleSlider2Change = (value: number) => {
    slider2Props.onChange(value);
    setWaveLength(value); // 
  };

  if (!isOpen) return null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <div style={{ marginRight: "40px" }}>
          <Slider {...slider1Props} onChange={handleSlider1Change} />
        </div>
        <div style={{ marginRight: "40px" }}>
          <Slider {...slider2Props} onChange={handleSlider2Change} />
        </div>
        <div>
          <Slider {...slider3Props} />
        </div>
        <svg width={waveLength} height={waveHeight} style={{ flexGrow: 1 }}>
           <path d={`M0,${waveHeight / 2} Q${waveLength / 4},0 ${waveLength / 2},${waveHeight / 2} T${waveLength},${waveHeight / 2}`} stroke="black" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export const SoundComponent = ({
  props,
  view,
}: {
  props: WidgetProps;
  view: EditorView;
}) => {
  let args = props.args;
  //let ranges = props.ranges;
  let types = props.types;
  let from = props.from;
  let to = props.to;
  //for future reference add a aclose button
  const handleCloseClick = () => {
    view.dispatch({
      effects: [openWidgetEffect.of(-1)],
    });
  };
  const [isSoundEditorOpen, setIsSoundEditorOpen] = useState(false);
  const buttonLabel = isSoundEditorOpen ? "Close" : "Open";
  const handleButtonClick = () => {
    setIsSoundEditorOpen(!isSoundEditorOpen);
    // Toggle the state to open/close the DualSlider
  };
  /*
  view.dispatch({
    changes: {
      from: from,
      to: to,
      insert:  //something from state of component`,
    },
    */

  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Button onClick={handleButtonClick}>{buttonLabel} Sound Editor</Button>
      <TripleSliderWidget
        slider1Props={startSliderProps}
        slider2Props={endSliderProps}
        slider3Props={DurationSliderProps}
        isOpen={isSoundEditorOpen}
      />
    </HStack>
  );
};
