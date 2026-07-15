/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SRV_BUTTON, SRV_POTENTIOMETER, SRV_ROTARY_ENCODER } from "jacdac-ts";
import { JacdacRoleType } from "./parse-roles";

/**
 * The Jacdac services this POC supports, with their friendly labels. Doubles
 * as the allowlist: only these services appear in the config/live views (which
 * also excludes infrastructure services and the jacdaptor/brain). Note a slider
 * is a potentiometer service; we label it "Slider".
 */
export interface SupportedService {
  serviceClass: number;
  type: JacdacRoleType;
  label: string;
}

export const SUPPORTED_SERVICES: SupportedService[] = [
  { serviceClass: SRV_BUTTON, type: "button", label: "Button" },
  {
    serviceClass: SRV_ROTARY_ENCODER,
    type: "rotary-encoder",
    label: "Rotary encoder",
  },
  { serviceClass: SRV_POTENTIOMETER, type: "slider", label: "Slider" },
];

export const supportedServiceByClass = (
  serviceClass: number
): SupportedService | undefined =>
  SUPPORTED_SERVICES.find((s) => s.serviceClass === serviceClass);

/** Friendly label ("Button" / "Rotary encoder" / "Slider") for a role type. */
export const labelForRoleType = (type: JacdacRoleType): string =>
  SUPPORTED_SERVICES.find((s) => s.type === type)?.label ?? type;
