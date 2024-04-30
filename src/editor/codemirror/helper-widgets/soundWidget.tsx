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
import { zIndexAboveDialogs } from "../../../common/zIndex";
import { start } from "repl";

type FixedLengthArray = [number, number, number, number, number, string, string];

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  sliderStyle?: React.CSSProperties;
  label: string;
  vertical: boolean;
  colour: string;
}


interface SVGprops {
  endFrequency: number;
  initialFrequency: number;
  endAmplitude: number;
  startAmplitude: number;
  waveType: string;
}

const WaveSVG: React.FC<SVGprops> = ({ endFrequency, initialFrequency, endAmplitude, startAmplitude, waveType}) => {

    console.log('wavepath generated', waveType)

    const waveLength = 400; // Width of the box
    const pathData = [];

    const frequencyDifference = endFrequency - initialFrequency;
    const amplitudeDifference = endAmplitude - startAmplitude;

    // Loop through the wave's width to generate the path
    for (let x = 0; x <= waveLength; x++) {
      const currentFrequency = (initialFrequency + (frequencyDifference * x) / waveLength)/100;
      const currentAmplitude = (startAmplitude + (amplitudeDifference * x) / waveLength)/2.2;
      const period = waveLength / currentFrequency


      // Calculate the y-coordinate based on the current frequency and amplitude
      let y = 0;
      switch (waveType.toLowerCase()) {
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
          const baseWave = 65 + currentAmplitude * Math.sin((x / period) * 2 * Math.PI);
          const randomNoise = Math.random() * 2 - 1;
          y = baseWave + randomNoise * (currentAmplitude * 0.3);
          break;
      }

        // Add the point to the path data
      pathData.push(`${x},${y}`);
    }

    return (
      <svg width="100%" height="100%">
            <path d={`M${pathData.join(' ')}`} stroke="black" fill="none" />
            <line
              x1="0%" // Start of the line
              y1="50%" // Vertically center the line
              x2="100%" // End of the line
              y2="50%" // Keep the line horizontal
              stroke="gray" 
              strokeWidth="0.5" 
            />
       </svg>

  )
    
  };


const startVolProps: SliderProps = {
  min: 0,
  max: 255,
  step: 1,
  value: 50,
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
  max: 9999,
  step: 1,
  value: 5000,
  onChange: (value) => {
    console.log("Slider value changed:", value);
  },
  sliderStyle: {
    width: "100%",
    height: "100px",
    backgroundColor: "lightgray",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  label: "End Freq",
  vertical: true,
  colour: 'green'
};

const startFrequencySliderProps: SliderProps = {
  min: 0,
  max: 9999,
  step: 1,
  value: 5000,
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
  max: 255,
  step: 1,
  value: 50,
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
  value,
  onChange,
  sliderStyle,
  label,
  vertical,
  colour
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
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
  freqStartProps: SliderProps;
  freqEndProps: SliderProps;
  volStartProps: SliderProps;
  volEndprops: SliderProps;
  props: WidgetProps;
  view: EditorView;
}> = ({ freqStartProps, freqEndProps, volStartProps, volEndprops, props, view}) => {

  

  let args = props.args;
  let ranges = props.ranges;
  let types = props.types;
  let from = props.from;
  let to = props.to;

  //parse args

  let argsToBeUsed: FixedLengthArray = [200, 500, 2000, 50, 50, "sine", "none"] // default args
  let count = 0
  for (let i = 2; i < args.length; i += 3) { //Update default args with user args where they exist
    argsToBeUsed[count] = args[i]
    if (args[i].split('_')[0] == 'SoundEffect.FX') {
      argsToBeUsed[count] = (args[i].split('_')[1]).toLowerCase()
    }
    let arg = args[i];
    console.log("arg: ", arg);
    count += 1;
  };

  console.log("args", argsToBeUsed)


  console.log("args", argsToBeUsed);

  const startFreq = Math.min(argsToBeUsed[0], 9999);
  const endFreq = Math.min(argsToBeUsed[1], 9999);
  const duration = Number(argsToBeUsed[2]);
  const startVol = Math.min(argsToBeUsed[3], 255);
  const endVol = Math.min(argsToBeUsed[4], 9999);
  const [waveType, setWaveType] = useState(argsToBeUsed[5]);
  const fx = argsToBeUsed[6];
  
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateView({duration: Number(newValue)});
  };

  const startFreqChange = (value: number) => {
    updateView({
      startFreq: value,
    });
  };

  const endFreqChange = (value: number) => {
    updateView({endFreq: value});
  };

  const startVolChange = (value: number) => {
    updateView({startVol: value});
  };

  const endVolChange = (value: number) => {
    updateView({endVol: value});
  };

  const handleWaveTypeChange = (value: string) => {
    setWaveType(value);
    updateView({waveType: value})
  };

  const handleFxChange = (value: string) => {
    updateView({fx: value});
  };

  
  const updateView = (change: Partial<ParsedArgs>) => {
    let insertion = statesToString({
      startFreq,
      endFreq,
      duration,
      startVol,
      endVol,
      waveType,
      fx,
      ...change,
    });
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

  const generateWavePath = () => {
    const waveLength = 400; // Width of the box
    const pathData = [];

    const frequencyDifference = endFreq - startFreq;
    const amplitudeDifference = endVol - startVol;

    // Loop through the wave's width to generate the path
    for (let x = 0; x <= waveLength; x++) {
      const currentFrequency =
        (startFreq + (frequencyDifference * x) / waveLength) / 100;
      const currentAmplitude =
        (startVol + (amplitudeDifference * x) / waveLength) / 2.2;
      const period = waveLength / currentFrequency;

      // Calculate the y-coordinate based on the current frequency and amplitude
      let y = 0;
      switch (waveType) {
        case "sine":
          y = 65 + currentAmplitude * Math.sin((x / period) * 2 * Math.PI);
          break;
        case "square":
          y =
            x % period < period / 2
              ? 65 + currentAmplitude
              : 65 - currentAmplitude;
          break;
        case "sawtooth":
          y =
            65 +
            currentAmplitude -
            ((x % period) / period) * (2 * currentAmplitude);
          break;
        case "triangle":
          const tPeriod = x % period;
          y =
            tPeriod < period / 2
              ? 65 + ((2 * currentAmplitude) / period) * tPeriod
              : 65 - ((2 * currentAmplitude) / period) * (tPeriod - period / 2);
          break;
        case "noisy":
          // Generate noisy wave based on sine wave and random noise
          const baseWave =
            65 + currentAmplitude * Math.sin((x / period) * 2 * Math.PI);
          const randomNoise = Math.random() * 2 - 1;
          y = baseWave + randomNoise * (currentAmplitude * 0.3);
          break;
      }
      // Add the point to the path data
      pathData.push(`${x},${y}`);
    }

    // Join the path data points to create the path
    return `M${pathData.join(" ")}`;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          backgroundColor: "snow",
          width: "575px",
          height: "150px",
          border: "1px solid lightgray",
          boxShadow: "0 0 10px 5px rgba(173, 216, 230, 0.7)",
          zIndex: 10,
        }}
      >
        {/* Vertical Slider 1 */}
        <div
          style={{
            marginLeft: "6px",
            marginRight: "20px",
            height: "100px",
            marginTop: "9px",
          }}
        >
          <Slider
            {...freqStartProps}
            value={startFreq}
            onChange={startFreqChange}
            vertical
          />
        </div>
        {/* Vertical Slider 2 */}
        <div style={{ marginRight: "20px", height: "100px", marginTop: "9px" }}>
          <Slider
            {...freqEndProps}
            // TODO: for this and all the following sliders we need value to come from the parsed args above
            //       and the handleXXXChange functions need to be updated to pass the relevant change to updateView
            value={endFreq}
            onChange={endFreqChange}
            vertical
          />
        </div>
        {/* Vertical Slider 3 */}
        <div style={{ marginRight: "20px", height: "100px", marginTop: "9px" }}>
          <Slider
            {...volStartProps}
            value={startVol}
            onChange={startVolChange}
            vertical
          />
        </div>
        {/* Vertical Slider 4 */}
        <div style={{ marginRight: "25px", height: "100px", marginTop: "9px" }}>
          <Slider
            {...volEndprops}
            value={endVol}
            onChange={endVolChange}
            vertical
          />
        </div>

        <div style={{ marginRight: "10px", height: "100px", fontSize: "12px" }}>
          {/* waveform type selection */}
          <label
            style={{ display: "block", marginBottom: "5px", marginTop: "7px" }}
          >
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

          <label
            style={{ display: "block", marginBottom: "5px", marginTop: "10px" }}
          >
            <b>Effects:</b>
          </label>
          <select onChange={(e) => handleFxChange(e.target.value)}>
            <option value="None">None</option>
            <option value="Vibrato">Vibrato</option>
            <option value="Tremelo">Tremelo</option>
            <option value="Warble">Warble</option>
          </select>

          {/* Duration selctor */}

          <label
            style={{ display: "block", marginBottom: "5px", marginTop: "10px" }}
          >
            <b>Duration(ms):</b>
          </label>
          {/* Input field with associated datalist */}
          <input
            type="text"
            value={duration}
            onChange={handleTextInputChange} // Handle the selected or typed-in value
            defaultValue="2000"
            style={{ width: "75px" }}
          />
        </div>
        {/* Waveform box */}
        <div
          style={{
            width: "200px",
            height: "130px",
            backgroundColor: "linen",
            marginTop: "9px",
            marginLeft: "5px",
          }}
        >
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
    let ranges = props.ranges;
    let types = props.types;
    let from = props.from;
    let to = props.to;

    //for future reference add a aclose button
    const handleCloseClick = () => {
      view.dispatch({
        effects: [openWidgetEffect.of(-1)],
      });
    };

    const updateView = () => {
      let insertion = "test";
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

  return (
    <HStack fontFamily="body" spacing={5} py={3} zIndex={10}>
      <Box ml="10px" style={{ marginRight: "4px" }}>
        <Button size="xs" onClick={handleCloseClick} bg="white">
          X
        </Button>
      </Box>
      <TripleSliderWidget
        freqStartProps={startFrequencySliderProps}
        freqEndProps={endFrequencySliderProps}
        volStartProps={startVolProps}
        volEndprops={endVolProps}
        props={props}
        view={view}
      />
    </HStack>
  );
};

//(startFreq: number, endFreq: Number, duration: Number, startVol: number, endVol: Number, waveform: string, fx: string)
interface ParsedArgs {
  startFreq: number;
  endFreq: number;
  duration: number;
  startVol: number;
  endVol: number;
  waveType: string;
  fx: string;
}

function statesToString({
  startFreq,
  endFreq,
  duration,
  startVol,
  endVol,
  waveType,
  fx,
}: ParsedArgs): string {
  if (fx.toLocaleLowerCase() == "none") {
    return `\n`
  + `        freq_start=${startFreq},\n`
  + `        freq_end=${endFreq},\n`
  + `        duration=${duration},\n`
  + `        vol_start=${startVol},\n`
  + `        vol_end=${endVol},\n`
  + `        waveform=SoundEffect.FX_${waveType.toUpperCase()}`
  } 
  return `\n`
  + `        freq_start=${startFreq},\n`
  + `        freq_end=${endFreq},\n`
  + `        duration=${duration},\n`
  + `        vol_start=${startVol},\n`
  + `        vol_end=${endVol},\n`
  + `        waveform=SoundEffect.FX_${waveType.toUpperCase()},\n`
  + `        fx=SoundEffect.FX_${fx.toUpperCase()}`;
}