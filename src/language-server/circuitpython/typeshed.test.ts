/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import base from "../../micropython/main/typeshed.en.json";
import { circuitPythonTypeshed } from "./typeshed";

describe("CircuitPython editor type data", () => {
  const files = circuitPythonTypeshed(base.files);
  it("keeps common Python types and removes micro:bit-only APIs", () => {
    expect(files["/typeshed/stdlib/builtins.pyi"]).toContain("class int");
    expect(
      Object.keys(files).some(
        (name) => name.includes("/microbit/") || name.endsWith("/music.pyi")
      )
    ).toBe(false);
    expect(files["/typeshed/stdlib/time.pyi"]).toBeUndefined();
    expect(files["/typeshed/stdlib/time/__init__.pyi"]).toContain(
      "def monotonic("
    );
    expect(JSON.parse(files["/src/pyrightconfig.json"]).pythonVersion).toBe(
      "3.10"
    );
  });
  it("uses real MCU-S2 pins and typed CircuitPython core APIs", () => {
    const board = files["/typeshed/stdlib/board/__init__.pyi"];
    for (const name of [
      "IO_POWER",
      "PD_POWER",
      "PD_PIN",
      "SCL",
      "SDA",
      "D1",
      "D2",
      "D3",
    ])
      expect(board).toContain(`${name}: microcontroller.Pin`);
    expect(board).toContain("def I2C() -> busio.I2C");
    expect(files["/typeshed/stdlib/digitalio/__init__.pyi"]).toContain(
      "class DigitalInOut"
    );
    expect(files["/typeshed/stdlib/analogio/__init__.pyi"]).toContain(
      "class AnalogIn"
    );
  });
  it("includes the sidebar's sensor and display driver surfaces", () => {
    expect(files["/circuitpython-libraries/adafruit_bme680.pyi"]).toContain(
      "def temperature(self) -> float"
    );
    expect(files["/circuitpython-libraries/hdc1080.pyi"]).toContain(
      "def humidity(self) -> float"
    );
    expect(files["/circuitpython-libraries/vl53lxcx/__init__.pyi"]).toContain(
      "def get_ranging_data(self) -> Results"
    );
    for (const name of [
      "adafruit_ssd1306.pyi",
      "adafruit_icm20x.pyi",
      "adafruit_veml6070.pyi",
      "adafruit_dps310/basic.pyi",
      "neopixel.pyi",
      "adafruit_ntp.pyi",
    ])
      expect(files["/circuitpython-libraries/" + name]).toBeDefined();
  });
});
