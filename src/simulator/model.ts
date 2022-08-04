export interface Sensor {
  type: "range";
  id: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
}
