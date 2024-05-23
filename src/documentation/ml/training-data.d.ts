type GestureID = number;

type RecordingData = {
  ID: number;
  data: {
    x: number[];
    y: number[];
    z: number[];
  };
};

enum PinTurnOnState {
  ALL_TIME,
  X_TIME,
}

type UsableIOPin = 0 | 1 | 2;

type GestureOutput = {
  matrix?: boolean[];
  sound?: SoundData;
  outputPin?: {
    pin: UsableIOPin;
    pinState: PinTurnOnState;
    turnOnTime: number;
  };
};

type SoundData = {
  name: string;
  id: string;
  path: string;
};

interface Confidence {
  currentConfidence: number;
  requiredConfidence: number;
  isConfident: boolean;
}

export type ActionData = {
  ID: GestureID;
  name: string;
  recordings: RecordingData[];
  output: GestureOutput;
  confidence: Confidence;
};

type MlSettings = {
  duration: number; // Duration of recording
  numSamples: number; // number of samples in one recording (when recording samples)
  minSamples: number; // minimum number of samples for reliable detection (when detecting gestures)
  automaticClassification: boolean; // If true, automatically classify gestures
  updatesPrSecond: number; // Times algorithm predicts data pr second
  numEpochs: number; // Number of epochs for ML
  learningRate: number;
  includedAxes: AxesType[];
  includedFilters: Set<FilterType>;
};

export type FilterType = (typeof Filters)[keyof typeof Filters];

export type AxesType = (typeof Axes)[keyof typeof Axes];
