# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT
# Public API of bundled circuitpython-hdc1080 1.0.0; see NOTICES.json.
from typing import Any
from busio import I2C

HDC1080_I2C_ADDR: int
class HDC1080:
    """HDC1080 temperature (°C) and relative humidity (%) sensor."""
    def __init__(self, i2c: I2C, address: int = 0x40) -> None: ...
    def reset(self) -> None: ...
    @property
    def temperature(self) -> float:
        """Temperature in degrees Celsius."""
        ...
    @property
    def humidity(self) -> float:
        """Relative humidity in percent."""
        ...
    @property
    def serial_number(self) -> Any: ...
    @property
    def firmware_version(self) -> Any: ...
    def configure(self, heater: bool = False, mode: str = "sequential", battery_status: bool = False) -> None: ...
