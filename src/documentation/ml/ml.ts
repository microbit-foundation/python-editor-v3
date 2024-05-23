import * as tf from "@tensorflow/tfjs";
import { LayersModel, SymbolicTensor } from "@tensorflow/tfjs";
import { FilterType, MlSettings, ActionData } from "./training-data";
import { Filters, determineFilter } from "./data-functions";

export const Axes = {
  X: "x",
  Y: "y",
  Z: "z",
} as const;

const settings: MlSettings = {
  duration: 1800,
  numSamples: 80,
  minSamples: 80,
  automaticClassification: true,
  updatesPrSecond: 4,
  numEpochs: 80,
  learningRate: 0.5,
  includedAxes: [Axes.X, Axes.Y, Axes.Z],
  includedFilters: new Set<FilterType>([
    Filters.MAX,
    Filters.MEAN,
    Filters.MIN,
    Filters.STD,
    Filters.PEAKS,
    Filters.ACC,
    Filters.ZCR,
    Filters.RMS,
  ]),
};

export const createModel = async (
  gestureData: ActionData[]
): Promise<LayersModel> => {
  const numberOfClasses: number = gestureData.length;
  const inputShape = [
    settings.includedFilters.size * settings.includedAxes.length,
  ];

  const input = tf.input({ shape: inputShape });
  const normalizer = tf.layers.batchNormalization().apply(input);
  const dense = tf.layers
    .dense({ units: 16, activation: "relu" })
    .apply(normalizer);
  const softmax = tf.layers
    .dense({ units: numberOfClasses, activation: "softmax" })
    .apply(dense) as SymbolicTensor;

  const model = new tf.LayersModel({ inputs: input, outputs: softmax });
  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.sgd(0.5),
    metrics: ["accuracy"],
  });
  return model;
};

// Whenever model is trained, the settings at the time is saved in this variable
// Such that prediction continues on with the same settings as during training

// makeInput reduces array of x, y and z inputs to a single number array with values.
// Depending on user settings. There will be anywhere between 1-24 parameters in

function makeInputs(sample: {
  x: number[];
  y: number[];
  z: number[];
}): number[] {
  const dataRep: number[] = [];

  settings.includedFilters.forEach((filter) => {
    const filterOutput = determineFilter(filter);
    if (settings.includedAxes.includes(Axes.X))
      dataRep.push(filterOutput.computeOutput(sample.x));
    if (settings.includedAxes.includes(Axes.Y))
      dataRep.push(filterOutput.computeOutput(sample.y));
    if (settings.includedAxes.includes(Axes.Z))
      dataRep.push(filterOutput.computeOutput(sample.z));
  });

  return dataRep;
}

export const trainModel = async (
  gestureData: ActionData[]
): Promise<LayersModel> => {
  const features: Array<number[]> = [];
  const labels: Array<number[]> = [];
  const numberofClasses: number = gestureData.length;

  gestureData.forEach((MLClass, index) => {
    MLClass.recordings.forEach((recording) => {
      // prepare features
      const inputs: number[] = makeInputs(recording.data);
      features.push(inputs);

      // Prepare labels
      const label: number[] = new Array(numberofClasses) as number[];
      label.fill(0, 0, numberofClasses);
      label[index] = 1;
      labels.push(label);
    });
  });

  const tensorFeatures = tf.tensor(features);
  const tensorLabels = tf.tensor(labels);
  const nn: LayersModel = await createModel(gestureData);
  const totalNumEpochs = settings.numEpochs;

  try {
    await nn.fit(tensorFeatures, tensorLabels, {
      epochs: totalNumEpochs,
      batchSize: 16,
      validationSplit: 0.1,
    });
  } catch (err) {
    console.error("tensorflow training process failed:", err);
  }
  return nn;
};

// Added files to the initial project to enable model class name retention and methods to simulate the model running on the device
export const modelModule = `# A mockup of a machine learning micropython module
from microbit import *
import random
import mlreader


def get_class_names():
    namesList = mlreader.read_class_names()
    return namesList


def current_action():
    list = mlreader.read_class_names()
    sizeList = len(list) - 1
    rnd = random.randrange(sizeList)
    return list[rnd]


def is_action(action):
    list = mlreader.read_class_names()
    if action in list:
        sizeList = len(list) - 1
        rnd = random.randrange(sizeList)
        if action == list[rnd]:
            return True
        else:
            return False
    else:
        return False


def was_action(action):
    list = mlreader.read_class_names()
    if action in list:
        sizeList = len(list) - 1
        rnd = random.randrange(sizeList)
        if action == list[rnd]:
            return True
        else:
            return False
    else:
        return False
`;
