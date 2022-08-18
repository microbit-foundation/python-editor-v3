export type Sensor = RangeSensor | EnumSensor | RadioSensor;

export interface RangeSensor {
  type: "range";
  id: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
}

export interface RangeSensorWithThresholds extends RangeSensor {
  lowThreshold: number;
  highThreshold: number;
}

export interface EnumSensor {
  type: "enum";
  id: string;
  choices: string[];
  value: string;
}

export interface RadioMessage {
  message: string;
  group: number;
  source: "code" | "user";
}

export interface RadioSensor {
  type: "radio";
  id: string;
  value: RadioMessage[];
  group: number;
  enabled: boolean;
}
