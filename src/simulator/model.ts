import { IconType } from "react-icons";
import { RiSunFill, RiTempHotFill } from "react-icons/ri";

export const sensorIcons: Record<string, IconType> = {
  temperature: RiTempHotFill,
  lightLevel: RiSunFill,
};

export interface Sensor {
  type: "range";
  id: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
}
