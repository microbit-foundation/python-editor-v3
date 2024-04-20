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
  vertical: boolean;
  colour: string;
}

const startVolProps: SliderProps = {
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
  label: "Start Vol",
  vertical: true,
  colour: 'red'
};

const endFrequencySliderProps: SliderProps = {
  min: 0,
  max: 999,
  step: 1,
  defaultValue: 500,
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
  vertical: true,
  colour: 'green'
};

const startFrequencySliderProps: SliderProps = {
  min: 0,
  max: 999,
  step: 1,
  defaultValue: 500,
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
  vertical: true,
  colour: 'blue'
};

const endVolProps: SliderProps = {
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
  label: "End Vol",
  vertical: true,
  colour: 'black'
};

const Slider: React.FC<SliderProps & { vertical?: boolean, colour: string }> = ({
  min,
  max,
  step,
  defaultValue,
  onChange,
  sliderStyle,
  label,
  vertical,
  colour
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div style={{ position: 'relative', height: '80px', width: '45px', display: "flex", flexDirection: "column", alignItems: "center" }}>
    <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={{
            position: 'absolute',
            width: '115px', // Width of the slider
            height: '40px', // Height of the slider
            transform: 'rotate(-90deg)', // Rotate the slider to vertical orientation
            accentColor: colour,
            bottom: '0%',
        }}
    />
    <div
        style={{
            position: 'absolute',
            left: 'calc(100% - 15px)', // Position the label to the right of the slider
            bottom: `${((value - min) / (max - min)) * 100}%`, // Calculate the position based on value
            transform: 'translateY(50%)', // Center the label vertically with the thumb
            fontSize: '13px', // Font size of the label
        }}
    >
        {value}
    </div>
    <div style={{ marginTop: '120px', textAlign: 'center', fontSize: '11px', }}>
        <b>{label}</b>
    </div>
</div>
  );
};


const TripleSliderWidget: React.FC<{
  slider1Props: SliderProps;
  slider2Props: SliderProps;
  slider3Props: SliderProps;
  slider4Props: SliderProps;
  isOpen: boolean;
}> = ({ slider1Props, slider2Props, slider3Props, slider4Props, isOpen }) => {

  const [startAmplitude, setStartAmplitude] = useState(slider3Props.defaultValue);
  const [endAmplitude, setEndAmplitude] = useState(50);
  const [initialFrequency, setInitialFrequency] = useState(50);
  const [endFrequency, setEndFrequency] = useState(50);
  const [waveType, setWaveType] = useState('sine')
  const waveformOptions = ["None", "Vibrato", "Tremolo", "Warble"]
  const [textBoxValue, setTextBoxValue] = useState("2000");

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTextBoxValue(newValue);
  };

  const handleSlider1Change = (value: number) => {
    slider1Props.onChange(value);
    setInitialFrequency(value/10);
  };

  const handleSlider2Change = (value: number) => {
    slider2Props.onChange(value);
    setEndFrequency(value/10); // 
  };

  const handleSlider3Change = (value: number) => {
    slider1Props.onChange(value);
    setStartAmplitude(value);
  };

  const handleSlider4Change = (value: number) => {
    slider1Props.onChange(value);
    setEndAmplitude(value);
  };

  const handleWaveTypeChange = (value: string) => {
    setWaveType(value);
  };



  const generateWavePath = () => {
    const waveLength = 400; // Width of the box
    const pathData = [];
    
    // Calculate the change in frequency and amplitude over the length of the waveform
    const frequencyDifference = endFrequency - initialFrequency;
    const amplitudeDifference = endAmplitude - startAmplitude;

    // Loop through the wave's width to generate the path
    for (let x = 0; x <= waveLength; x++) {
      // Calculate the frequency and amplitude at the current point
      const currentFrequency = initialFrequency + (frequencyDifference * x) / waveLength;
      const currentAmplitude = startAmplitude + (amplitudeDifference * x) / waveLength;
      const period = waveLength/currentFrequency
      

      // Calculate the y-coordinate based on the current frequency and amplitude
      let y = 0;
      switch (waveType) {
        case 'sine':
          y = 65 + currentAmplitude * Math.sin((x / period) * 2 * Math.PI);
          break;
        case 'square':
          y = x % period < period / 2 ? 65 + currentAmplitude : 65 - currentAmplitude;
          break;
        case 'sawtooth':
          y = 65 + currentAmplitude - ((x % period) / period) * (2 * currentAmplitude);
          break;
        case 'triangle':
          const tPeriod = x % period;
          y = tPeriod < period / 2
            ? 65 + (2 * currentAmplitude / period) * tPeriod
            : 65 - (2 * currentAmplitude / period) * (tPeriod - period / 2);
          break;
        case 'noisy':
          // Generate noisy wave based on sine wave and random noise
          // Add a random noise value to the sine wave
          const baseWave = 65 + currentAmplitude * Math.sin((x / period) * 2 * Math.PI);
          const randomNoise = Math.random() * 2 - 1; // Random noise between -1 and 1
          y = baseWave + randomNoise * (currentAmplitude*0.3);
          break;
      }
      
      // Add the point to the path data
      pathData.push(`${x},${y}`);
    }

    // Join the path data points to create the path
    return `M${pathData.join(' ')}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-start", backgroundColor: 'snow', width: '575px', height: '150px', border: '1px solid lightgray'}}>
          {/* Vertical Slider 1 */}
          <div style={{marginLeft: "6px", marginRight: "20px", height: '100px', marginTop: '9px'}}>
              <Slider {...slider1Props} onChange={handleSlider1Change} vertical />
          </div>
          {/* Vertical Slider 2 */}
          <div style={{ marginRight: "20px", height: '100px', marginTop: '9px'}}>
              <Slider {...slider2Props} onChange={handleSlider2Change} vertical />
          </div>
          {/* Vertical Slider 3 */}
          <div style={{ marginRight: "20px", height: '100px', marginTop: '9px' }}>
              <Slider {...slider3Props} onChange={handleSlider3Change} vertical />
          </div>
          {/* Vertical Slider 4 */}
          <div style={{ marginRight: "25px", height: '100px', marginTop: '9px' }}>
              <Slider {...slider4Props} onChange={handleSlider4Change} vertical />
          </div>
          

        <div style={{ marginRight: '10px', height: '100px', fontSize: '12px' }}>

            {/* waveform type selection */}
          <label style={{ display: 'block', marginBottom: '5px', marginTop: '7px',}}>
                <b>Waveform:</b>
          </label>
          <select onChange={(e) => handleWaveTypeChange(e.target.value)}>
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
            <option value="noisy">Noisy</option>
          </select>

          {/* fx type selection */}

          <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px'}}>
                <b>Effects:</b>
          </label>
          <select onChange={(e) => handleWaveTypeChange(e.target.value)}>
            <option value="sine">None</option>
            <option value="square">Vibrato</option>
            <option value="sawtooth">Tremelo</option>
            <option value="triangle">Warble</option>
          </select>

          {/* Duration selctor */}

          <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>
              <b>Duration(ms):</b>
          </label>
          {/* Input field with associated datalist */}
          <input
            type="text"
            value={textBoxValue}
            onChange={handleTextInputChange} // Handle the selected or typed-in value
            defaultValue="2000" 
            style={{ width: '75px' }}
          />

        </div>
          {/* Waveform box */}
          <div style={{ width: '200px', height: '130px', backgroundColor: 'linen', marginTop: '9px', marginLeft: '5px'}}>
              <svg width="100%" height="100%">
                  <path d={generateWavePath()} stroke="black" fill="none" />
                  <line
                      x1="0%" // Start of the line
                      y1="50%" // Vertically center the line
                      x2="100%" // End of the line
                      y2="50%" // Keep the line horizontal
                      stroke="gray" // Line color
                      strokeWidth="0.5" // Line thickness
                  />
              </svg>
          </div>
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
// <Button onClick={handleButtonClick}>{buttonLabel} Sound Editor</Button>
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={handleCloseClick} bg="white">
          X
        </Button>
      </Box>
      <TripleSliderWidget
        slider1Props={startFrequencySliderProps}
        slider2Props={endFrequencySliderProps}
        slider3Props={startVolProps}
        slider4Props={endVolProps}
        isOpen={isSoundEditorOpen}
      />
    </HStack>
  );
};
