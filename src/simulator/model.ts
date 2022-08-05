export type Sensor = RangeSensor | EnumSensor;

export interface RangeSensor {
  type: "range";
  id: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
}

export interface EnumSensor {
  type: "enum";
  id: string;
  choices: string[];
  value: string;
}
