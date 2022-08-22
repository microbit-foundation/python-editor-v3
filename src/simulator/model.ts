export type Sensor = RangeSensor | EnumSensor | DataLoggingSensor;

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

export interface LogData {
  key: string;
  value: string | number;
}

export interface DataLoggingSensor {
  type: "log";
  id: string;
  value: [LogData[]];
  period: number;
  serial: boolean;
  delete: boolean;
}
