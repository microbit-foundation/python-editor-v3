/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

// Matches @internationalized/number's detection. Intl.NumberFormat's
// "unit" style needs Safari 14.1/iOS 14.5; our floor is 14.0, where
// react-aria's fallback covers only degree/narrow and throws for
// anything else, so other units must not be requested there.
const supportsUnitStyle = (() => {
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "unit",
        unit: "degree",
      }).resolvedOptions().style === "unit"
    );
  } catch (e) {
    return false;
  }
})();

/**
 * Format options for a sensor slider's announced value (screen readers
 * hear these; the visible labels are app-rendered and unaffected).
 *
 * Only units in ECMA-402's sanctioned list can be expressed: temperature
 * (celsius) and compass heading (degree). The accelerometer/compass axes'
 * mg/nT have no Intl equivalent and stay bare numbers.
 */
export const sensorUnitFormatOptions = (
  unit: string | undefined
): Intl.NumberFormatOptions | undefined => {
  switch (unit) {
    case "°C":
      return supportsUnitStyle
        ? { style: "unit", unit: "celsius", unitDisplay: "long" }
        : undefined;
    case "deg":
      // degree/narrow is the one combination react-aria polyfills, so the
      // pre-14.5 iOS fallback can keep a unit here ("360°").
      return supportsUnitStyle
        ? { style: "unit", unit: "degree", unitDisplay: "long" }
        : { style: "unit", unit: "degree", unitDisplay: "narrow" };
    default:
      return undefined;
  }
};
