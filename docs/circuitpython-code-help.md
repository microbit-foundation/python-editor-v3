# CircuitPython code help

The browser language server uses a CircuitPython API environment for the senseBox
MCU-S2. The previous micro:bit-only modules and timing functions are removed from
its virtual typeshed. Common Python builtins and typing definitions remain.

Type data is bundled locally and loaded with the language server, including when
the editor is used offline after its assets have been cached. The editor does not
query PyPI or GitHub while providing suggestions. User project modules continue
to be provided to Pyright through the existing project filesystem integration.
No editor type files are copied to CIRCUITPY.

## Sources and coverage

- Official `circuitpython-stubs` **10.3.0**, including the upstream
  `sensebox_mcu_esp32s2` board definition. `microcontroller.pin` references are
  derived from its GPIO mappings plus the internal IMU pins used in the examples.
- Public signatures, properties, inheritance and docstrings from the same pinned
  **20261016** Adafruit source bundle as the transfer libraries. The selected
  sidebar drivers and their dependencies cover BME680, HDC1080, DPS310, ICM20948,
  VEML6070, VL53LxCX, SSD1306, NeoPixel / matrix, and NTP.
- Reviewed `.pyi` overrides for the documented HDC1080 and VL53LxCX interfaces
  whose upstream source does not annotate their measurement results. The `time`
  override follows the [CircuitPython 10.3.0 time API](https://docs.circuitpython.org/en/10.3.0/shared-bindings/time/index.html).
- `adafruit-circuitpython-typing` **1.13.0** supplies driver protocol types.

`src/language-server/circuitpython/NOTICES.json` records versions, source URLs,
input SHA-256 values and retained source headers. License texts are alongside it.
The source preparation only parses Python; it does not import or execute drivers.
Regenerate with:

```sh
python3 tools/prepare-circuitpython-stubs.py
```

Downloads are cached under `/tmp` and hash checked before generation. Small
reviewed overrides live in `src/language-server/circuitpython/overrides/`.
The generated `typeshed.json` is distinct from the hash-verified transfer assets;
preparing editor types does not modify those assets.

The type environment is API help, not a CircuitPython compiler or hardware probe.
Availability of optional core features still depends on firmware and hardware.
Unannotated driver surfaces may remain unknown; the entire transfer catalog is
not claimed to have full type coverage. Official API documentation is generally
English; diagnostics and the editor remain localized. Real argument and attribute
errors are no longer suppressed by the former MicroPython compatibility filters.

## Transfer phases

The device's optional `transferProgress` callback reports library preparation,
board preparation, file processing, save synchronization, MCU verification and
program start. This callback supplements the existing connection library's
progress API.

The dialog marks the active step, shows a file-local count/bar while processing
files, and uses a labeled spinner during work of unknown duration. Reaching the
end of file processing does not present the complete transfer as 100% finished.
The verification step explains that the board confirmation may take up to 60
seconds. It advances to program start only after the existing MCU size/checksum
gate and normal REPL confirmation succeed. Failure closes the dialog and uses
the existing error feedback; it does not show a successful start.
