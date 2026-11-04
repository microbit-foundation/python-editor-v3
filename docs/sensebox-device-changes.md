# senseBox connection and code transfer

## 2026-11-04 — CircuitPython code help and transfer phases

- The language server now uses bundled CircuitPython 10.3.0 core type data, the
  official MCU-S2 pin definition and 15 sidebar driver/dependency modules instead
  of micro:bit-only APIs. The local types retain source provenance and licenses;
  generation parses pinned sources without executing them or changing transfer
  assets. User project modules and project `lib/` take priority over driver types.
- Removed the old blanket time/NeoPixel diagnostic suppression. Valid
  CircuitPython APIs are described by actual types; genuine argument and
  attribute mistakes remain visible. Detailed coverage and maintenance notes:
  [CircuitPython code help](circuitpython-code-help.md).
- The optional transfer callback reports library preparation, board preparation,
  file processing, host synchronization, MCU verification and program start.
  The dialog highlights the current phase, shows file-local counts while writing
  and labeled spinners during work of unknown duration. The verification phase
  explains the existing 60-second deadline. File completion does not imply that
  the board has verified the project or started the program.
- Serial connection, directory selection, byte comparison, library preparation
  before writes, host flushing, checksum/size gate, normal REPL acknowledgement
  and restart behavior are retained. New editor type files are never installed
  on the board. No new analytics events or program-content logging were added.
- Validation: all 535 unit tests, five headless Chrome code-help/progress cases,
  TypeScript, ESLint, translation checks and production build passed. Browser
  cases exercise the real language-server worker and simulated board APIs.
  The verification dialog was visually inspected. Regenerating the type data
  produced identical bytes; all 198 generated type files parse without execution.

## 2026-11-04 — Flush equal required files before MCU verification

- The user reported a 30–45-second local Linux transfer ending in a `sync` error.
  The host volume was writable and visible to the Vite server. A request using
  the exact boot marker and the existing 162-byte `code.py` received HTTP 204
  from the flush helper in 79 ms. The user reported a successful transfer after
  that diagnostic flush. This is consistent with delayed host writeback, but is
  not proof of the cause of the earlier failure.
- The transfer previously called the optional host helper only for newly written
  files. If the prior attempt had saved the bytes but timed out verifying them,
  a retry could see equal host bytes, skip writing and skip flushing as well.
  Other editors can leave equal bytes pending in the OS cache too.
- The local helper now receives all required project/library entries after the
  existing fresh byte comparison and writes. Equal files remain unwritten.
  Helper validation still checks board identity, paths, sizes and SHA-256 before
  synchronizing files and directories. Hosted builds retain their normal path.
- The authoritative MCU size/checksum gate, repeated matching interval, 60-second
  visibility deadline, normal REPL confirmation and restart checks remain in place.
  A host-flush acknowledgement cannot cause a restart without MCU confirmation.
- Regression coverage includes all-equal transfers, a retry after helper failure
  and a verification timeout, and unchanged browser writes on a second transfer.
  Physical diagnostics only synchronized the existing file; they did not change
  the user's program or request a restart.
- Validation: 61 targeted device/host-flush unit tests and two headless Chrome
  transfer/library scenarios passed. Browser tests use simulated serial and drive
  APIs; the actual helper endpoint was checked separately on the host. TypeScript,
  ESLint, formatting/diff checks and the production build passed.

## 2026-11-04 — Connection button location and Linux serial permissions

- German and English connection-error messages now point to the connection
  button at the bottom left, matching the current action bar. The shared serial
  connection and separate directory-selection / transfer actions are unchanged.
- A host-side read-only investigation found the attached senseBox MCU-S2 as
  `/dev/ttyACM0`, with the expected USB vendor/product IDs `303a:81b9`.
  The device node was owned by `root:dialout` with mode `0660`, without a user
  ACL. The current user was not in `dialout`, so it lacked OS-level serial access.
- README documents permanent group membership with a fresh desktop login and
  a temporary per-device ACL for immediate access. Setting either requires
  administrator authentication; the editor cannot grant itself those rights.
  No board files or serial commands were written during this investigation.
- After the user applied the per-device ACL, the host confirmed read/write
  permission and successfully opened and closed the serial port without sending
  any data. The port was left closed for the browser to reconnect. This verifies
  OS-level access; the browser's physical-device chooser was not automated.

## 2026-10-23 — Recognise CircuitPython modules in editor diagnostics

- Suppressed missing-import diagnostics only for CircuitPython built-ins and
  libraries present in the pinned transfer catalog. Unknown imports remain
  diagnostics.
- Suppressed the unsupported MicroPython-stub diagnostic for CircuitPython's
  `time.monotonic` without hiding other diagnostics on the same line.

## 2026-10-23 — Simplify settings and project downloads

- Removed the two checkbox controls from the editor settings.
- The project save action now downloads the main program as a Python file; the
  former HEX save action and its extra menu are no longer exposed.
- Replaced user-visible MicroPython wording with CircuitPython in the German and
  English editor interface.

## 2026-10-23 — Keep a single serial output

- Removed the separate REPL console from the right side of the editor. Serial
  input and output now use only the existing panel below the editor.
- Added a visible **Clear console** action to the lower serial panel and updated
  the hardware end-to-end checks to target that panel.

## 2026-10-23 — Use the ICM20948 IMU

- Replaced the MPU6050-based acceleration examples with the senseBox's
  ICM20948 IMU using `adafruit_icm20x` at address `0x68`.
- The separate acceleration and gyroscope blocks now share an `imu` object,
  and the gyroscope output uses the library's `rad/s` unit.
- Added a resolver test for the documented import and its transitive CircuitPython
  libraries.

## 2026-10-23 — Simplify the documentation navigation for senseBox

- Removed the generated API category and its sidebar, search and editor-hover
  navigation surfaces.
- Moved the console output examples from the former **Grundlagen** category
  into **Text**, updated all documentation links and removed the now-empty
  category.
- Replaced user-visible legacy board names and links with senseBox wording in
  every translated message catalog. The header, help and about surfaces no
  longer expose legacy board imagery or links. Package names, compatibility
  types and copyright notices remain unchanged where they are required by the
  inherited implementation and licences.

## 2026-10-23 — Use inline Wi-Fi credentials in Wi-Fi and NTP examples

- Updated the Wi-Fi connection blocks and the NTP initialization block to use
  the same explicit `CIRCUITPY_WIFI_SSID` and `CIRCUITPY_WIFI_PASSWORD`
  variables.
- The NTP example no longer reads credentials from `settings.toml`; it connects
  with `wifi.radio.connect(...)` before creating the socket pool and NTP client.
- Both pages use the same connection status output and warn against sharing code
  that contains real credentials.

## 2026-10-23 — Use CircuitPython's built-in RTC

- Replaced the external DS3231 examples in `content/de/zeit/rtc.md` with blocks
  that consistently use CircuitPython's built-in `rtc` module.
- Initializing, setting, reading individual date/time fields and creating a Unix
  timestamp now all share one `rtc.RTC()` object. A final complete example
  combines initialization, setting and reading.
- The RTC blocks no longer enable the I²C port or import `adafruit_ds3231`, so
  transferring them does not install an additional RTC driver. The NTP example
  continues to resolve its own library normally.

## 2026-10-22 — Remove temporary test artifacts

- Removed the ignored `test-results/` directory containing failed-run metadata,
  browser screenshots and an end-to-end error context generated during local
  verification.
- Removed the ignored `playwright-report/` directory containing the generated
  HTML test report and its copied error-context data.
- Retained `node_modules/`, `styled-system/`, compiled message catalogs and
  generated MicroPython type stubs. Although ignored by Git, these are active
  dependencies or build outputs required by the installed development setup and
  are recreated by the documented npm workflows.
- Retained `reports/` because its `.gitkeep` files are tracked project structure,
  and retained every modified or untracked source, content, icon, catalog and
  library asset belonging to the implemented editor changes.
- A repository-wide scan found no remaining temporary, backup, rejected-patch,
  swap-file or operating-system metadata files outside dependencies.

## 2026-10-22 — Use match/case for logic case distinctions

- The **Fallunterscheidung** entry in the Logik category now demonstrates
  Python's `match`/`case` syntax directly. It includes two named modes and a
  wildcard `case _` fallback instead of translating the example to an
  `if`/`elif`/`else` chain.

## 2026-10-22 — Refine documentation navigation and search

- Every topic in **Sensoren** and **Module** now has a distinct local SVG icon
  and German alternative text. The ten new illustrations cover acceleration,
  environmental data, brightness/UV, air pressure, the photodiode, ToF ranging,
  the LED matrix, OLED display, RGB LED and Wi-Fi; the existing temperature
  illustration also gained alternative text. These repository-owned icons were
  created for this editor.
- **Text**, **Logik**, **Schleifen**, **Mathematik** and **Variablen** use the new
  `direct` section option. Because each contains one topic, selecting its tab now
  opens the draggable blocks immediately instead of showing a redundant topic
  card first. Multi-topic sections such as **Zeit**, **Sensoren** and **Module**
  retain their navigation level. The option is validated in the sidebar config
  and documented in `docs/content.md`.
- The tab rail is wider, while each tab is slightly shorter, so long names such
  as Mathematik and Variablen remain readable. The open sidebar has a slightly
  larger minimum width and initial screen-width share. At short viewport heights
  the rail scrolls independently with a narrow translucent thumb, transparent
  track and brighter hover state matching the branded background. The rail and
  every tab now derive their width from the available sidebar space; horizontal
  overflow is clipped so only the intended vertical scrollbar can appear.
- Documentation search is indexed as soon as section content is ready. It no
  longer remains unavailable while the independently generated API reference is
  absent or still loading; API results are added when that index becomes ready.
  Search-language checks are case-insensitive, and Portuguese (`pt-BR`) now uses
  its existing worker. Empty result groups are hidden, and the `docs_search`
  event is emitted once per search session instead of from a React state updater.
  The analytics event name and parameter contract did not change.
- Validation includes section/search unit tests, TypeScript and lint. Browser
  checks in German at 1440 × 900 and 1024 × 700 confirmed direct block access,
  all seven sensor icons, the independently scrolling rail, successful HDC1080
  search navigation and a single analytics event.

## 2026-10-22 — Add Python categories

### Reference and colours

- The new **Text**, **Logik**, **Schleifen**, **Zeit**, **Mathematik** and
  **Variablen** sidebar sections provide the corresponding Python building
  blocks as draggable examples.
- Category hues are converted to CSS hex colours for the Python editor:

  | Category   | Hue | Sidebar colour |
  | ---------- | --: | -------------- |
  | Text       | 160 | `#5ba68d`      |
  | Logik      | 210 | `#5b80a6`      |
  | Schleifen  |  10 | `#a6685b`      |
  | Zeit       | 140 | `#5ba674`      |
  | Mathematik | 230 | `#5b68a6`      |
  | Variablen  | 330 | `#a65b80`      |

### Block coverage and Python mapping

- **Text** provides text literals, joining/coercing values, appending to a
  variable, length and empty checks.
- **Logik** provides `if`, `if`/`else`, `if`/`elif`/`else`, all six comparison
  operators, `and`, `or`, `not`, Boolean values and a Python `match`/`case`
  `match`/`case` equivalent for a switch-style case distinction.
- **Schleifen** is now a separate category instead of a Grundlagen page. It
  provides fixed repetition, `while`, `until`, an inclusive counter loop with
  positive or negative step size, `break` and `continue`.
- **Zeit** covers all six general time blocks from the MCU toolbox: delays in
  milliseconds and microseconds, elapsed milliseconds and microseconds,
  indefinite waiting and periodic intervals. Separate pages implement the
  external DS3231 RTC blocks, CircuitPython's internal RTC blocks and the NTP
  blocks. The external RTC example powers the senseBox I²C ports and waits
  100 ms before the first bus access.
- **Mathematik** covers the 14 toolbox block groups and their field variants:
  number literals, arithmetic, negation, scalar functions, trigonometry,
  constants, number-property tests, variable changes, rounding, remainder,
  limiting, integer and floating-point random values and range mapping.
- **Variablen** provides the dynamic set/get blocks and examples for the six
  senseBox variable types: character, text, Boolean, number, large number and
  decimal number. Python values are dynamically typed, so the type-selection
  examples document suitable initial values instead of adding artificial type
  declarations.
- All entries are draggable Python source blocks. The generated code uses
  CircuitPython-compatible standard modules and syntax. Static imports in the
  DS3231 and NTP examples are handled by the existing transfer-time dependency
  resolver; the pinned catalog already supplies `adafruit_ds3231`,
  `adafruit_ntp`, `adafruit_bus_device` and `adafruit_register`.

### Editor and content changes

- `content/sidebar.json` registers the six sections, their order, descriptions,
  icons and accent colours. `accentColor` is an optional, validated six-digit
  hex property in the documentation section configuration and is documented in
  `docs/content.md`.
- The sidebar forwards the accent colour to each tab and renders it behind the
  tab icon. Its tab list can now shrink and scroll vertically, keeping all
  documentation categories and the project tab reachable at smaller viewport
  heights.
- Sidebar symbols use existing Remix Icon components from `react-icons`. The
  coloured topic illustrations in `content/images/` are original repository
  SVGs created for these pages.
- New German reference pages live below `content/de/text`, `logik`, `schleifen`,
  `zeit`, `mathematik` and `variablen`. Other languages continue to use the
  configured German fallback until translated pages are added. The former
  Grundlagen loop page was moved, and its BME680 cross-reference was updated.
- No analytics event was added or changed.

### Validation and hardware limits

- 39 targeted documentation, sidebar/configuration and CircuitPython library
  tests passed. TypeScript type checking, the full lint run and
  `git diff --check` also passed.
- 97 Python snippets across the affected category pages were parsed
  successfully. A Chromium layout check at 1440 × 900 confirmed that the page
  itself does not overflow and that the sidebar tab list scrolls to the project
  tab.
- The DS3231 examples require the external RTC on the powered I²C bus. NTP
  requires an active network connection and a configured socket pool. Read
  snippets that refer to `externe_uhr`, `interne_uhr` or `ntp` must be combined
  with their matching initialization block first.

## 2026-10-22 — Install the HDC1080 sensor module

- The temperature example imports `HDC1080` from `hdc1080`, but that module is
  not part of CircuitPython itself or the pinned Adafruit 10.x bundle. The import
  was therefore left unresolved and failed on the board.
- The published MIT-licensed senseBox `circuitpython-hdc1080` 1.0.0 wheel is now
  included in the generated library catalog with its pinned SHA-256. Static
  `from hdc1080 import HDC1080` imports automatically install `lib/hdc1080.py`,
  `adafruit_bus_device` and `adafruit_register` before `code.py` is written.
- The example waits 100 ms after enabling the senseBox I²C port power before
  creating the sensor. Without this settling time, the first I²C access can fail
  with `OSError: [Errno 5]`, even though the module was installed correctly.
- The payload participates in the existing host comparison, MCU checksum gate
  and restart sequence.
- Validation: all 408 catalog payloads and their embedded file hashes passed the
  integrity test. The documented import resolves the published driver and both
  declared dependencies before transfer.

## 2026-10-22 — Retry transient Windows removable-drive writes

- Chromium replaces a file through a temporary swap file. On Windows, a
  connected and writable FAT-based CIRCUITPY volume can briefly reject one of
  the open, write or replacement operations with a generic `DOMException`,
  including `NotFoundError` or `UnknownError`.
- A generic browser filesystem failure is now retried up to two times with a
  short delay. Each attempt reacquires the file and directory handles and reads
  the current target bytes again. This also handles a `close()` call that
  committed the replacement before reporting failure.
- Known permanent errors are not retried: read-only or locked filesystems,
  revoked permissions and insufficient space retain their existing specific
  messages. A persistent generic failure still discards the selected directory,
  requests no restart and reports that the project may be partially written.
- The retry does not weaken transfer verification. Changed files still pass
  through the optional local host flush and must be confirmed by CircuitPython
  with matching sizes and checksums before the normal REPL is restored and the
  final soft restart is requested.
- Validation: all 54 device-transfer unit tests passed, including a transient
  write failure and a `close()` failure reported after the replacement was
  already committed. The host-flush suite, TypeScript and targeted ESLint also
  passed.

## Follow-up: HDC1080 temperature example (2026-10-20)

- `content/de/sensoren/temperatur.md`: replaces the temperature placeholder
  with a runnable HDC1080 example for temperature and relative humidity.
- The block enables the senseBox connections, initializes the sensor over I²C,
  prints both readings with two decimal places and repeats every two seconds.
  Its title and short user-facing explanation now describe both measured values
  without adding unnecessary technical detail. The existing entry slug remains
  unchanged so links to the block continue to work.

## Follow-up: LED matrix module block (2026-10-20)

- `content/de/module/led-matrix.md`: adds a clearly named **LED-Matrix** topic
  to the **Module** section. Its runnable block scrolls text across the 12 × 8
  matrix connected to port A.
- The example keeps the required senseBox power, NeoPixel and matrix setup, but
  uses short German variable names and limits the explanation to connection,
  text, color, brightness and scrolling speed. The existing alphabetical module
  ordering places it before the OLED display without a sidebar configuration
  change.
- The imported `neopixel` and `adafruit_pixel_framebuf` libraries already exist
  in the pinned CircuitPython 10.x library catalog, so no generated library
  assets were changed.
- The documentation content test passed. The broader library-integrity test
  still reports checksum mismatches in the existing generated CircuitPython
  payloads (including `adafruit_24lc32`, `adafruit_ssd1306` and `neopixel`);
  those hash-verified assets were not modified as part of this change.

## Follow-up: Time-of-Flight (ToF) sensor blocks (2026-10-20)

- `content/de/sensoren/vl53l8cx.md`: adds the sensor as **Time-of-Flight (ToF)
  Sensor** to the **Sensoren** reference section. The page provides clearly
  named, composable blocks for initialization, starting an 8 × 8 measurement
  and reading valid distance values, plus a complete runnable example based on
  the supplied code.
- The hardware explanation and Python setup only describe and configure the I²C
  connection. The optional low-level LPn and `D3` configuration was removed to
  keep the blocks approachable.
- This is documentation content only. It does not change device connection,
  transfer, synchronization or automatic CircuitPython library resolution.

Change record: 2026-10-19. This file records the requested behavior and the
implementation decisions so they remain available in later work sessions.

## Expected behavior

- The button at the top right connects to the senseBox serial port once. It does
  not select a drive, read project files or transfer code. Opening a serial port
  can show output from code already on the board; that is not a code transfer.
- The lower **CIRCUITPY-Verzeichnis auswählen / Select CIRCUITPY folder** button
  opens the native directory picker and remembers the selected drive. It does not
  transfer code. The adjacent **Code übertragen / Transfer code** button transfers
  the current project and remains disabled until a directory has been selected.
  Without a serial connection, transfer explains that the upper button must be
  used first.
- Select the root of the board's **CIRCUITPY** drive and allow write access. Do
  not select `lib`, Downloads or a bootloader drive.
- The directory must contain `boot_out.txt` identifying CircuitPython. A wrong
  selection reports an error and can be corrected with the directory button.
  Cancelling never transfers code.
- The directory is remembered for this connection. Disconnecting, unplugging or
  a file write failure discards it. The browser serial port and the selected drive
  must belong to the same board; the browser APIs do not provide a shared identity
  with which to enforce this automatically.
- Project files with matching names are replaced only when their bytes differ.
  Unrelated board files are
  retained. Transfer stops the running program, waits for the REPL prompt, writes
  dependencies before `code.py`, closes every file, waits for board-side size and
  checksum confirmation and then requests a soft restart.
  Terminal keystrokes are ignored while the transfer is active.
- A transfer success message means the files were closed, their contents were
  confirmed readable on the board and the restart command was sent. Runtime errors in the user's program still appear in the console.

## Implementation changes

- `src/device/web-file-system-device.ts`: owns both the serial connection and the
  selected directory. Implements serial input/output, queued writes, REPL prompt
  acknowledgement with timeout, transfer ordering, cancellation, error categories,
  reader cleanup and connection loss handling. Connecting never transfers files.
- `src/repl/index.tsx`: removes its independent serial connection. Uses the shared
  project connect/disconnect actions and the existing xterm terminal, including
  keyboard input, Ctrl-C, Ctrl-D and ANSI rendering. Clear only clears the console.
- `src/project/project-actions.tsx`: keeps the serial picker in the connect button
  gesture; exposes directory selection independently from transfer; handles
  CircuitPython errors explicitly; catches statistics failures and confirms
  successful transfer. A cancelled serial picker is not logged as success.
- `src/project/SendButton.tsx`: marks transfer as busy and disables repeat clicks;
  renders separate directory-selection and transfer buttons for CircuitPython,
  and disables transfer until a directory is selected. The upper button remains
  the connection control.
- `src/fs/fs.ts`: adds file-based CircuitPython statistics, avoiding micro:bit HEX
  firmware downloads and HEX size constraints on the transfer path.
- `src/common/use-action-feedback.tsx`: fixes the generic error heading to use the
  title message with rich-text values supplied, rather than formatting the rich
  description without its required link value. This avoids displaying the
  `unexpected-error-description` key.
- `src/serial/XTerm.tsx`: handles rejected serial writes instead of leaving an
  unhandled promise rejection.
- `lang/ui.en.json`, `lang/ui.de.json`: add directory instructions, connection and
  transfer errors, success and console labels; rename the transfer button.
- `src/logging/analytics.ts`, `docs/analytics-events.md`: retain CircuitPython error
  categories in failure events and describe the updated flow and file statistics.
  The legacy `web_usb` transport value remains for analytics compatibility.
- `AGENTS.md` links this record and preserves the requested button behavior for
  future work sessions.
- Tests cover connection without file transfer, serial input/output, folder
  validation and cancellation, repeated transfers, REPL timeout, write failure,
  unplugging and statistics without HEX firmware. Browser tests exercise the real
  device implementation with the browser serial and directory APIs substituted.
  The existing E2E page object uses the new transfer button label.

## Validation and limits

Automated tests simulate the USB-facing browser APIs. Physical board behavior,
operating-system write caching and the user's actual sensor program require a
hardware check. The implementation does not format or erase the board filesystem
and does not reinstall CircuitPython firmware.

Validation results for this change:

- `npm run typecheck` / `npx tsc --noEmit`: passed, including the new test files.
- `npm test -- --run --maxWorkers=1 --testTimeout=15000`: 365 tests passed in
  51 files. The initial parallel run exceeded several HEX test timeouts and the
  headless grammar parsing time budget under load; the sequential run passed.
- `npm test -- --run src/common/use-action-feedback.test.tsx`: both additional
  English/German error-heading regression tests passed.
- `npm run test:e2e:headless -- src/e2e/sensebox-device.test.ts --workers=1`:
  both Chromium browser tests passed. These exercise connection without writes,
  REPL keyboard forwarding, latest editor contents, directory reuse, wrong-folder
  correction and write failure. Their timeout includes cold editor/server startup.
- `npm run i18n:tidy -- --check`, Prettier checks and `git diff --check`: passed.
- `npm run lint`: passed with no warnings.
- Playwright Chromium was installed in the local browser cache for validation.
  Browser tests required running outside the sandbox because the sandbox cannot
  bind the local development-server port (`EPERM`).

## Follow-up: read-only CIRCUITPY drive (2026-10-19)

The user's follow-up browser exception was `NoModificationAllowedError` with the
message that the underlying filesystem could not be modified. This was reproduced
independently of the app on the attached board:

- A native, uniquely named temporary-file probe failed on creation with
  `EROFS` / `[Errno 30] Read-only file system`. It created no files and never
  modified `code.py`, its libraries or the existing Chrome swap files.
- The host reported `/run/media/joscha/CIRCUITPY` on `/dev/sda1` as VFAT mounted
  `ro` with `errors=remount-ro`. The block device itself was not write-protected.
- Kernel messages showed `fat_free_clusters: deleting FAT entry beyond EOF` and
  `Filesystem has been set read-only`. These messages already occurred before the
  editor connection refactor. The volume also had an unclean-unmount warning.
- The original Chrome files `code.py.crswap` and `code.py.1.crswap` were retained.
  Their presence is evidence of incomplete browser saves, not proof that they
  caused the FAT damage. No automatic deletion, format or forced read-write
  remount was attempted.
- All 13 readable files (10,657 bytes) were copied to
  `/tmp/sensebox-circuitpy-backup-20261019-104730` and verified byte-for-byte using
  SHA-256 against the mounted drive. This temporary-directory backup is local to
  this machine/session and should be retained separately if needed long-term.
- The user ran `sudo fsck.fat -n /dev/sda1`. It reported a boot-sector volume-label
  mismatch, one unused cluster and the dirty bit, then explicitly left the
  filesystem unchanged. The volume was subsequently cleanly unmounted with
  `udisksctl unmount -b /dev/sda1` in preparation for repair.

The actual filesystem repair requires administrator access and explicit approval
for its potentially irreversible FAT metadata changes. Do not treat a code change
or a successful mock browser test as a repair of the physical volume. Device
names such as `/dev/sda1` are session-specific: identify the senseBox volume again
before running filesystem tools in a later session.

Further implementation changes:

- `src/device/web-file-system-device.ts`: wraps each file operation with its
  filename and step (`open-file`, `create-writer`, `write-file`, `close-file`).
  `NoModificationAllowedError` maps to `filesystem-state`, permission errors to
  `permission`, and `QuotaExceededError` to `storage-full`. Other exceptions retain
  the `write` category and their original cause. Cleanup errors cannot replace the
  original failure, including when `close()` itself failed. Failed file writes
  discard the directory handle and never trigger a restart or a success event.
- `src/project/project-actions.tsx`: supplies the affected filename to localized
  errors and adds flat `file_name`, `operation` and `error_name` context to the
  diagnostic error report. Program source is not logged.
- `lang/ui.en.json`, `lang/ui.de.json`: distinguish a read-only/locked filesystem,
  revoked browser permission and insufficient disk space. The filesystem-state
  error explains that reselecting a directory alone cannot clear the OS state;
  it recommends closing other writers and regular disconnect/mount/reselection,
  without asserting a board defect or requiring filesystem repair.
  A browser `NoModificationAllowedError` alone can also indicate a file lock; the
  app does not claim to distinguish these without host-level evidence.
- `src/device/web-file-system-device.test.ts`: adds regression coverage for the
  exact browser exception at every file-writing step, including failure during
  close/cleanup, plus permission, disk-space and ordinary write errors.
- `src/e2e/sensebox-device.test.ts`: adds a production-flow browser test for the
  reported read-only error at `createWritable()`, before any project data is
  written. It verifies the actionable German message and absence of a restart.
- `docs/analytics-events.md`: records the additional failure-code categories and
  diagnostic context. No new analytics event names were introduced.

Follow-up validation:

- 26 targeted unit tests passed across device I/O, generic error formatting and
  analytics, including all eight new filesystem error regressions.
- All three Chromium browser tests passed, including the exact reported
  `NoModificationAllowedError` at writer creation. Browser tests simulate the
  device APIs and do not modify the real board.
- `npx tsc --noEmit`, `npm run i18n:tidy -- --check` and `git diff --check` passed.

### Recovery without repair and host-write synchronization

The user declined filesystem repair and reported that saving from another editor
and copying `code.py` through the file manager work. No repair command was executed:
its automatic approval was rejected, and the user's refusal was respected. No
formatting, forced read-write remount or firmware change was performed.

The previously unmounted volume was restored with ordinary
`udisksctl mount -b /dev/sda1`, without force/remount options. It mounted `rw`.
The same native temporary-file test then successfully created, flushed, replaced,
read back and removed its own test files. The volume remained mounted `rw`.
All original 13 files still matched the verified backup byte-for-byte. This
restored the host write path without changing the user's program. The earlier
read-only state was real, but does not establish a hardware defect or justify
assuming that a repair is necessary for every recurrence.

Comparison with the [official deployed CircuitPython editor](https://code.circuitpython.org/assets/js/index.js)
showed the same File System Access write/close sequence and an additional
`_waitForHostFlushImpl` check before restart. The browser save returning does not
by itself establish that the microcontroller can already read the newly written
contents. The app now adds its own board-side verification instead of changing
to serial file writes or bypassing CircuitPython's USB filesystem ownership.

- `src/device/web-file-system-device.ts`: after all files close, issues a read-only
  REPL check of every transferred file's exact length and Adler-32 components.
  The board reads in 256-byte chunks; program files are not executed by the check.
  Polls stale data for up to 15 seconds. A missing serial response times out after
  at most 3 seconds per request. Only an explicit matching response permits the
  soft restart. A unique, line-anchored marker prevents echoed commands from being
  mistaken for a response. No verification response, stale contents or read errors
  cause a `sync` failure without a restart or success event. User terminal input
  remains suppressed during transfer and verification. Internal verification
  commands and responses are kept out of the visible terminal.
- `lang/ui.en.json`, `lang/ui.de.json`: add a dedicated synchronization-timeout
  message. The selected directory is retained for a synchronization failure;
  selecting a different directory is not proposed as the solution.
- `src/device/web-file-system-device.test.ts`: covers delayed host writes becoming
  visible, permanently stale contents, missing acknowledgement and echoed commands
  without acknowledgement. Successful-transfer tests require verification between
  file close and restart.
- `src/e2e/sensebox-device.test.ts`: the simulated board explicitly acknowledges
  synchronization, so production-flow browser tests cover the restart gate too.
- The Python code generated by the actual implementation was also executed in a
  temporary local fixture under CPython: Unicode text and binary files matched,
  while a same-length one-byte change and a missing file were rejected. This
  validates the generated Python/checksum calculation, not actual board execution.
- All 21 device unit tests passed after adding this synchronization gate and
  keeping internal verification responses out of the user's terminal. All three
  browser tests also passed with explicit board-side synchronization responses.
- Typecheck, lint and translation-catalog checks passed after the synchronization
  changes. `AGENTS.md` preserves the requirement to verify device-visible files
  before a soft restart.

The real board's `code.py` and libraries were not overwritten for validation. A
full browser upload to that board remains a user check after reconnecting and
selecting CIRCUITPY again, because the old browser directory handle may refer to
the previous mount.

## Follow-up: copied code remains in REPL instead of running (2026-10-19)

The user reported that `code.py` was present on the drive but the `sync` error
prevented automatic execution. Their serial log showed part of the generated
friendly-REPL `exec(...)` command and a verification result of `0`. The previous
checksum gate intentionally skipped Ctrl-D on failure, leaving the board in REPL
where auto-reload is disabled. Earlier mock acknowledgements and CPython fixture
checks had not established reliable CircuitPython serial protocol behavior.

This change replaces the friendly-REPL command/marker exchange described above.
The requirement to verify the files before restarting is retained.

- `src/device/web-file-system-device.ts`: enter Raw REPL with Ctrl-A and wait for
  its complete prompt. Send the Python verification source directly in bounded
  128-byte UTF-8 chunks with pacing, rather than a long echoed `exec(...)` line.
  File paths are rooted at `/`, independent of the current REPL working directory.
- Wait for the full raw execution frame: `OK`, stdout, Ctrl-D, stderr, Ctrl-D and
  the final `>` prompt. Parsing tolerates byte-fragmented reads, distinguishes a
  real `0` mismatch from absent/incomplete frames and preserves Python stderr as
  the original cause. Each response has up to five seconds within the 15-second
  visibility deadline. Internal code and protocol responses remain hidden from
  the user terminal.
- Always restore normal/friendly REPL with Ctrl-C + Ctrl-B and wait for `>>> `,
  including on verification failure. A successful transfer sends its separate
  final Ctrl-D only after that acknowledgement. In Raw REPL, Ctrl-D executes the
  supplied source; in normal REPL, Ctrl-D performs the soft reboot and runs
  `code.py`. Failure recovery does not reboot or replace the original error.
- `src/device/web-file-system-device.test.ts`: replace the marker-only mock with
  explicit raw/friendly modes and framed responses. Tests distinguish Ctrl-D used
  to execute a raw check from Ctrl-D used to restart, cover fragmented responses,
  delayed return to normal REPL, Python errors, stale data, incomplete responses
  and visible program output after restart.
- `src/e2e/sensebox-device.test.ts`: the simulated board now tracks protocol mode,
  returns complete raw frames, counts only normal-mode soft reboots and emits
  program output after restart. The repeated-transfer test expects two reboots
  and the visible `PROGRAM STARTED` output.
- `AGENTS.md`: preserve the invariant that normal REPL must be confirmed before
  the final reboot Ctrl-D. `docs/analytics-events.md`: clarify what synchronization
  failure means in the corrected protocol. No new analytics event was added.

### Direct validation on the attached senseBox

After the user released the browser's serial connection, a native read-only
protocol probe confirmed Raw REPL access on CircuitPython 10.3.0. Both `code.py`
and `/code.py` had the same length and checksum as the host's copy.

The actual edited `WebFileSystemConnection` implementation was then loaded in a
Node harness with a serial adapter to the real USB port. The harness called the
real connect, REPL, file-verification and software-reset methods; it did not supply
fake verification responses or rewrite program files.

- Board-side verification of the existing 439-byte `code.py` succeeded in about
  90 ms through the application's new raw protocol implementation.
- The application returned to normal REPL and sent the soft reset. The board
  emitted `weicher reboot`, `code.py Ausgabe:` and the normal auto-reload-enabled
  message, confirming the reboot and the start of the existing code.
- `code.py` was compared byte-for-byte before/after and was unchanged. No program
  file, library, firmware, filesystem mount or storage configuration was changed.
- The serial adapter closed the port after the test, so the browser can reconnect.

This proves the actual application's verification/reset sequence on the MCU with
an existing file. A browser upload of freshly edited code still uses File System
Access; the direct serial probe deliberately did not overwrite the user's code.

Final regression coverage also includes reconnecting when a previous session left
Raw REPL active: transfer entry sends Ctrl-C, Ctrl-C, Ctrl-B and confirms normal
REPL before writing. The final version of the actual application methods was
retested on the board: verification succeeded in 89 ms and the expected soft
reboot/program-start output was observed again, with `code.py` unchanged.

The protocol distinction is documented in the
[MicroPython raw-mode reference](https://docs.micropython.org/en/latest/reference/repl.html#raw-mode-and-raw-paste-mode)
and was confirmed directly on this CircuitPython board. This follow-up does not
remove file verification or reboot blindly after a failed verification.

Validation of the final raw-protocol change:

- 25 device unit tests passed, including byte-fragmented frames, delayed normal
  prompt, previous-session Raw REPL recovery and correct program-start output.
- All three Chromium browser tests passed with mode-aware serial simulation.
- Typecheck, full lint (with the final touched files rechecked), formatting and
  `git diff --check` passed.
- Direct board validation used the actual application methods and confirmed the
  soft reboot twice; no MCU program files were modified by these checks.

## Follow-up: soft reboot followed by Errno 5 (2026-10-19)

The latest user log explicitly includes `weicher reboot` and then an immediate
`code.py Ausgabe: OSError: [Errno 5] Eingabe-/Ausgabefehler`, without a Python
traceback. The restart command is now taking effect; this report must not be
classified as another missing Ctrl-D. An immediate source-load failure is
consistent with this output, but a host-write timing cause has not been proven.
The previous hardware tests only checked existing files and must not be presented
as validation of a freshly saved program.

Further implementation changes:

- `src/device/web-file-system-device.ts`: require repeated exact file matches over
  at least one second before leaving Raw REPL. Any mismatch resets this interval.
  Extend the visibility deadline from 15 to 60 seconds to allow delayed host
  writes. This guards against restarting after a single transient successful read;
  it does not force an OS flush or prove that all host metadata writes are done.
- Observe console output for one second after the restart request. Recognize the
  reported immediate, traceback-free Errno 5 after the `code.py` output header,
  including German/English headers and ANSI status sequences. Report the `start`
  error instead of a success event. Output remains visible in the terminal; the
  directory is retained and no automatic rewrite or restart is attempted. A user
  program traceback remains console output. This is a limited load-error check,
  not a guarantee that a user's program completes or drives its peripherals.
- `lang/ui.de.json`, `lang/ui.en.json`: the progress dialog now says **Code wird
  übertragen / Transferring code**, its detail explains project-file transfer,
  and serial ready/completed labels use transfer wording. Add the specific
  post-restart read-error message.
- Device tests cover a transient match followed by stale data, the supplied
  German/ANSI log, English and byte-fragmented errors, no success event after
  a load failure, and user-code tracebacks. Browser coverage checks the actual
  progress heading and the save/restart/load-error flow.
- `docs/analytics-events.md`: document `start` and the extended verification gate.

At the initial checkpoint, no physical MCU file had been written by this
follow-up. The user subsequently authorized the fresh-save hardware test; its
results and remaining browser-specific limitation are recorded below.

Validation for this follow-up:

- 29 device unit tests and all four Chromium browser tests passed. The browser
  tests substitute USB APIs and do not write to the physical board.
- Typecheck, targeted lint, translation-catalog compilation/tidy checks, formatting
  and `git diff --check` passed.
- With the serial port free, the previously authorized read-only protocol test
  was repeated using the actual changed verification and restart methods. The
  current existing `code.py` matched after 1,293 ms; the soft reboot and `code.py`
  output header appeared without Errno 5 in the captured output. The file was
  byte-for-byte unchanged after the test, and the port was closed. This is still
  an existing-file test, not a fresh-save reproduction or visual OLED check.

### Authorized fresh-save hardware test

The user explicitly authorized backing up the current `code.py`, saving the same
contents again on the real board and checking startup. With the browser serial
connection released, the real `WebFileSystemConnection.flash()` method was loaded
from the edited TypeScript source and connected to the physical serial port.
Verification responses came from CircuitPython, not a simulated board.

For this native harness, directory/file handles were adapters to the mounted
CIRCUITPY filesystem. Saving created a uniquely named staging file, wrote and
closed it, and renamed it over `code.py`, without adding an explicit host fsync
or sync command. This exercises the app's complete write/verify/restart sequence
and a real replacement save. It does not exercise Chrome's own File System Access
implementation, native picker or permission UI. Chromium also stages writes before
replacement on close; see its
[file writer implementation](https://chromium.googlesource.com/chromium/src/+/main/content/browser/file_system_access/file_system_access_file_writer_impl.cc).
The adapter is not claimed to reproduce every Chromium implementation detail.

Two identical-content saves succeeded:

- First complete `flash()` call: 33,254 ms; soft reboot and `code.py` startup output
  appeared without `OSError` or a Python traceback.
- Second call with per-phase measurement: REPL entry 797 ms; file write/close/rename
  170 ms; board-side file verification 32,388 ms; restart observation 1,001 ms;
  total 34,359 ms. The final soft reboot again produced the normal `code.py` output
  and completion/autoreload messages without a load error. No visual OLED check
  was performed.
- This directly establishes that the old 15-second verification deadline is too
  short for this attached host/board write path. The current 60-second deadline
  accommodated the observed delay. It does not prove that the one-second stable
  read interval is the sole fix for all instances of the reported Errno 5.
- `code.py` was 440 bytes, SHA-256
  `8f1b5761a0b7082d6d15fd837db45bd78d9c74fd98a4fc94451b34a2607fd70b`.
  Its contents remained identical. All 11 existing files, including libraries and
  hidden files, had identical before/after SHA-256 values; no staging file remained.
- Verified current-code backups and checksum manifests are on the computer at
  `/tmp/sensebox-write-test-20261019-BDymo4` and
  `/tmp/sensebox-write-test-20261019-O7BXHR`. The native harnesses are
  `/tmp/sensebox-app-write-check.cjs` and
  `/tmp/sensebox-app-write-timing.cjs`; they are session-local test artifacts.
- The serial port was closed after each check. A direct host `findmnt` check after
  the first save showed CIRCUITPY still mounted `rw`, with no new FAT errors in the
  checked kernel log. An earlier `ro` observation came from the isolated runtime's
  different mount view and was corrected; it was not a new drive failure.
- No repair, format, mount change, firmware change or library write was performed.

Added a device regression test in `src/device/web-file-system-device.test.ts`:
matching contents can remain unavailable beyond 15 seconds and still cause one
verified restart once they become consistently readable within the new deadline.
The four existing browser tests still provide simulated browser-flow coverage;
a fresh save through Chrome on the actual board remains distinct from these
successful native hardware writes.

Final validation after adding the slow-write regression: all 30 device tests,
TypeScript typecheck, targeted test-file lint and `git diff --check` passed.
The final direct-host check after both saves again showed `rw`, all 11 current
file hashes matching both pre-test manifests, matching code backups, and no owner
of `/dev/ttyACM0`. The browser can reconnect to the released serial port.

## Follow-up: avoid unnecessary replacement saves (2026-10-19)

The user reported successful but slow transfers and requested a shorter transfer
time. The previous fresh-save measurement isolated about 32 seconds in board-side
visibility checking after a replacement save. The user chose **only optimize the
editor**, declining the proposed temporary Linux `sync` mount experiment. No
unmount, mount-option change, system configuration or repair was performed.

Implementation changes:

- `src/device/web-file-system-device.ts`: obtain a fresh `File` snapshot from the
  target handle for each project entry. Compare its size and, for equal sizes,
  every byte with the current project. Only create a writable stream when the
  contents differ. New files are still created and populated, changed files with
  identical lengths are still replaced, and unrelated files are retained.
- The comparison does not cache a previous upload's checksum or assume the board
  contents remained unchanged. Modification or deletion through another editor is
  detected at the next transfer. Binary contents are compared as bytes.
- All project entries, including files skipped as identical on the host, still
  undergo the same board-side checksum gate. The 60-second visibility deadline,
  one-second stable-read interval, normal REPL acknowledgement and post-restart
  load-error observation are retained. Even an all-identical transfer checks the
  actual board and requests a soft restart.
- Add `read-file` to the existing file-operation error context for comparison
  failures; preserve their original cause and existing error categories. A read
  failure stops the transfer before further writes or restart. This is documented
  in `docs/analytics-events.md`; no analytics event or failure code was added.
- Device tests model stored files and cover byte-identical binary content,
  same-length differences, equal dependencies, external changes/deletions and
  read failures. The repeated-transfer browser test also asserts that the second
  identical transfer adds zero writes while still restarting.

Physical-board performance check:

- The native harness loaded the actual changed `flash()` method, fresh target-file
  snapshots and physical serial responses. It refused to proceed if the browser
  owned the port, and asserted zero writer creations for the matching program.
- The current 457-byte `code.py` was compared unchanged. Complete transfer,
  verification and restart observation took **2,308 ms**: REPL entry 12 ms;
  target comparison 2 ms; board verification 1,291 ms; restart observation 1,002 ms.
  A soft reboot and the normal `code.py` output appeared without a Python error.
- All current file contents matched before/after SHA-256 manifests. The verified
  backup and manifests are at `/tmp/sensebox-write-test-20261019-E3vveS`; the harness
  is `/tmp/sensebox-app-unchanged-timing.cjs`. The port was closed afterwards.
- This establishes the fast path for already matching contents. New/changed files
  still require host writes and can still incur the measured Linux writeback
  delay. It does not establish that an edited `code.py` now transfers in 2.3 s.
  Unchanged libraries/assets avoid replacement writes even when code changes.
- As before, the native filesystem adapter does not validate Chrome's own
  File System Access implementation or picker. Browser tests simulate those APIs.

Validation: all 35 device tests and all four Chromium browser tests passed,
including the five new comparison/read-error regressions and the browser write
counter assertion. Typecheck, targeted lint, formatting and `git diff --check`
passed. The existing stale-board regression now explicitly starts with matching
host files and was rerun successfully: skipping a host write cannot bypass a
missing board-side match. `AGENTS.md` also preserves the fresh-byte comparison
rule and warns against relying on a previous-upload cache.

## Follow-up: accelerate changed saves in the local Linux editor (2026-10-19)

The user confirmed the slow case persists and that the editor is served locally
at `http://localhost:3000`. The earlier request to optimize only the editor still
applies. The existing Vite server can flush files without changing Linux mount
options, installing a service or changing MCU storage ownership.

Implementation:

- `dev-tools/circuitpython-flush.ts`, `vite.config.ts`: add a Linux development-server
  middleware at `<base>__sensebox__/flush`. It discovers mounted, writable VFAT
  volumes from the server's `/proc/self/mountinfo`. Exactly one volume must match
  the directory name and the selected drive's complete `boot_out.txt` contents.
  It checks changed-file sizes and SHA-256 values, synchronizes the regular files,
  then synchronizes their containing directory so the replacement directory entry
  reaches USB too. It does not write new content or run a global `sync` command.
- Requests require a loopback connection, a loopback Origin matching Host, POST
  and JSON. Body/file-count/byte limits apply. Client-supplied paths, traversal,
  duplicate entries and symlink targets are rejected. Ambiguous or mismatching
  volumes/files are not flushed. No CORS access is granted to other origins.
- `src/device/circuitpython-flush-protocol.d.ts`: shared, type-only request shape.
- `src/device/circuitpython-host-flush.ts`: send directory identity and changed-file
  names/sizes/SHA-256 values to the local helper, without program contents or an
  absolute host path. Restrict calls to loopback hostnames and use a five-second
  timeout. Absence/rejection/failure falls back to normal MCU visibility checks.
- `src/App.tsx`: supply this acceleration only for the development build.
  Production/hosted builds do not call it. The server middleware is Linux-only.
- `src/device/web-file-system-device.ts`: collect the files actually replaced and
  await the optional host flush after every writer closes, before Raw REPL file
  verification. Identical files do not cause a host flush request. Callback failure
  does not bypass the MCU gate or produce a false success. The 60-second deadline,
  stable read interval, prompt acknowledgement and restart observation are retained.
- `tsconfig.node.json`: include the new development tooling in the Node config.
  `README.md` and `AGENTS.md` describe the local helper and preserve its limits.
  `docs/analytics-events.md` records that no analytics event or failure code changed.

Physical hardware check after the user released the serial connection:

- The actual edited `flash()` method wrote a freshly staged file and replaced
  `code.py`, called the real HTTP middleware on localhost:3000, verified the MCU's
  actual serial responses and requested a soft reboot. The native file adapter
  deliberately reported a different existing size to force an identical-content
  replacement, keeping the user's program unchanged while exercising the changed
  save path. It did not simulate MCU checksum or restart responses.
- Total time **2,796 ms**, compared with previous replacement-save measurements
  of 33,254 / 34,359 ms: REPL entry 13 ms; file write/close/rename 169 ms; actual
  local HTTP host flush 326 ms (HTTP 204); board verification 1,284 ms; restart
  observation 1,002 ms. The board emitted a soft reboot and normal `code.py`
  output/completion messages without `OSError` or traceback.
- Current `code.py`: 447 bytes, SHA-256
  `b39d9ec607c49b56d44d640bb8569c403f3b89ec99563bfe82e65a44e5aef908`.
  All board file contents matched their before/after manifests. Backup and
  manifests: `/tmp/sensebox-write-test-20261019-TyeJIb`; native harness:
  `/tmp/sensebox-app-local-flush-timing.cjs`. The port was closed after the test.
- This test includes a real replacement save, real Linux flush and real MCU. Its
  native file adapter still differs from Chrome's own File System Access writer;
  the live browser client is covered separately by simulated browser API tests.
- No mount/unmount, Linux configuration, filesystem repair, firmware or library
  changes were made. The endpoint is active in the already-running local dev
  server; the browser can reconnect after reloading.

Validation:

- 63 current unit/integration cases passed: 38 device cases plus 25 browser-helper
  and local-server cases. These cover identity/content mismatches, multiple boards,
  malformed/foreign/oversized requests, path/symlink rejection, bounded preparation
  and network timeouts, correct call ordering and host acknowledgement without
  matching MCU contents.
- All five Chromium browser tests passed. They check the actual browser Origin and
  directory identity in the local request, one request for the changed first save,
  no additional request/write for the identical second save, and continued MCU
  verification/startup if the helper returns HTTP 503. These USB APIs are simulated.
- The first browser run was interrupted by a development-server reload while the
  production build regenerated watched files. The final run completed after build
  and source edits stopped; no test timeout was increased to hide the interruption.
- Main application typecheck and a dedicated strict ES2021 typecheck of the new
  server tooling passed. Targeted lint, formatting and `git diff --check` passed.
- `npm run build` passed. The generated production JavaScript contains no local
  flush endpoint reference. Its standard large-chunk warning remains.
- An additional standalone `tsconfig.node.json` check exposed existing issues in
  `panda.config.ts` (preset typing/source inclusion) and the pre-existing
  `vitest/config` `UserConfig` import. Those unrelated configuration issues were
  not changed; all newly added server code passed the dedicated strict check.
- `FileHandle.sync()` is the Node filesystem synchronization API used by this
  helper; see the [Node.js filesystem documentation](https://nodejs.org/api/fs.html#filehandlesync).

## 2026-10-19 — Install libraries required by Python imports

Request: install the required libraries on the board automatically when the
project imports them, without a separate library-copy step.

Behavior and implementation:

- `src/device/circuitpython-libraries.ts` parses real Python import syntax with the
  existing CodeMirror Python parser. This covers `import`, `from`, aliases,
  multiline imports and imports inside functions/conditionals; comments and string
  literals do not count. Starting from `code.py`, it follows reachable project
  modules, package initializers and relative imports, with cycle detection. When
  no entry point exists, it scans the project's Python files.
- It resolves catalog modules and their transitive dependencies. Firmware modules
  such as `board`, `digitalio` and `time` require no asset download. Project-owned
  modules, including modules in `lib/`, take precedence over automatic libraries,
  including when used as another library's dependency. Unrelated/unreachable
  project files do not cause additional installations.
- `src/App.tsx` supplies the loader for both development and production builds.
  Assets come from the editor's own base URL; there is no runtime GitHub/PyPI
  request. Only the needed modules are downloaded, in batches of at most six.
  Successful immutable downloads are cached in memory; failed downloads can retry.
  Payload and decoded file SHA-256 values are checked before any board writes.
- `tools/prepare-circuitpython-libraries.py` deterministically generates the
  catalog and same-origin assets from the official
  [Adafruit bundle release 20261016](https://github.com/adafruit/Adafruit_CircuitPython_Bundle/releases/tag/20261016).
  The three source archives/metadata inputs have pinned SHA-256 values. The
  generated catalog contains 407 modules. The third-party assets total 5,365,282
  bytes, including notices, license texts and Python source payloads for copyleft
  modules; these supporting files stay on the editor server. Each module retains
  its upstream license. Provenance, versions, original source links and SPDX
  copyright notices are in `public/circuitpython/adafruit-10-20261016/`.
- Compiled libraries target CircuitPython **10.x**. Before any required downloads,
  `boot_out.txt` must identify a compatible major version; a firmware-only project
  does not require this library-version check. The official library guidance
  requires matching `.mpy` files and firmware major versions; see
  [CircuitPython libraries](https://circuitpython.org/libraries).
- `src/device/web-file-system-device.ts` prepares every required library before
  interrupting the running program or writing files. A library preparation error
  keeps existing files and the selected directory, produces a localized `library`
  error with the module name, and requests no restart. English/German translations
  and `docs/analytics-events.md` include this new error code. No new analytics
  events or program contents are recorded; project storage statistics still
  count only user-owned project bytes.
- Files are written into nested `lib/` directories. For example,
  `import adafruit_ssd1306` installs `adafruit_ssd1306`, `adafruit_framebuf`, the
  `adafruit_bus_device` package and the default root `font5x8.bin` resource/license.
  User project files take precedence when destinations overlap. Libraries precede
  `code.py`. Existing equal files are freshly compared and skipped; a new empty
  package initializer is treated as a changed file so its directory gets flushed.
- The existing board length/checksum gate now covers libraries and resources too.
  The local Linux flush helper supports safe nested relative file paths and flushes
  file contents followed by all parent directories, deepest first. Traversal and
  symlink directories remain rejected. The 60-second visibility deadline, normal
  REPL acknowledgement and soft-restart checks are retained.
- No library cleanup is performed when an import is removed. Unknown third-party
  modules, arbitrary PyPI packages and dynamically constructed imports are not
  installed automatically. Imports inside conditional code are conservatively
  included even if that branch does not run. Installation does not guarantee that
  a sensor or library supports every board configuration. Firmware updates,
  filesystem repair and mount-option changes are outside this change.
- README and AGENTS document the behavior and regeneration. `.prettierignore`
  excludes generated catalog/payload JSON: reformatting would invalidate hashes.

Physical board verification:

- Before writing, all current board files were copied and SHA-256 verified under
  `/tmp/sensebox-library-test-20261019-3ALOMB/board`. The current 454-byte `code.py`
  has SHA-256 `2c3567177bb4775e89bda43f9299fc1bea9f4b01ac0b435dd8753415f4bd7379`.
  It imports `adafruit_ssd1306`. Its contents were preserved exactly.
- `/tmp/sensebox-app-library-install.cjs` ran the actual edited library loader and
  device `flash()` implementation against localhost:3000, a native filesystem
  adapter and real serial MCU responses. It prepared seven required asset files
  (11,551 bytes). Four files needed writing; existing equal libraries/font and
  `code.py` were skipped. All installed file hashes matched the asset contents;
  unrelated original files retained their hashes.
- First transfer: **4,377 ms**, including the actual HTTP flush (204, 510 ms), MCU
  verification (1,527 ms) and restart observation (1,001 ms). A second transfer
  took **2,532 ms**, performed no replacement writes and again verified/restarted.
  The device emitted a soft reboot and normal `code.py` output/completion without
  `OSError` or traceback. The serial port was closed afterwards.
- The native file adapter uses real nested directories and replacement saves;
  it does not simulate checksum or restart replies. Chrome's specific filesystem
  writer is covered by browser tests with simulated USB/filesystem APIs. This is
  not a claim that physical Chrome hardware automation was performed.

Validation for this change:

- 78 unit/integration cases passed across the library resolver/asset integrity,
  device transfer, browser flush and local server suites. They cover all 407
  catalog payload hashes and embedded file hashes, import forms and local module
  graphs, transitive dependencies, custom module precedence, incompatible firmware,
  failed-download retry, nested writes/flush, symlink/traversal rejection, and
  failure before writes/restart.
- All seven Chromium browser tests passed, including real same-origin library
  asset downloads, binary `.mpy`/package/font writes before `code.py`, no writes on
  an identical second transfer, and a localized download error before serial
  interruption or any board writes. USB/filesystem responses are simulated here.
- Main application TypeScript check, dedicated strict ES2021 server tooling check,
  full ESLint, i18n compile/tidy check, targeted Prettier and `git diff --check`
  passed. The production build passed and includes the static library assets;
  its existing large-chunk warning remains.

## 2026-10-19 — Restore the original transfer dialog

At the user’s request, both recent dialog revisions were reverted. The original
German/English title, explanatory paragraphs and selection-button labels are
restored, together with the original browser-test text expectations. No device,
library-installation or transfer logic was changed.

## 2026-10-19 — Accept only the CIRCUITPY root directory

- `selectDirectory()` continues to use `showDirectoryPicker({ mode: "readwrite", id: "circuitpy" })` directly from the selection button. There is no file picker
  and no requirement to select an individual file. Before reading the boot marker,
  the returned handle must now be a directory named `CIRCUITPY` (case-insensitive).
  It must also contain a readable `boot_out.txt` identifying CircuitPython.
- Files, `lib`, Downloads, bootloader volumes and similarly named backup folders
  are rejected with `wrong-directory` before reads/writes. A corrected root
  selection succeeds on the next attempt. Nothing changes in library installation,
  writing, MCU verification or restart behavior.
- German/English instructions explicitly ask the user to confirm the drive's root
  directory without clicking a file/subfolder. Wrong-directory feedback now states
  the accepted root directly. Existing browser mocks model real directory-handle
  kinds and retain the root-without-file-selection transfer scenario.
- The native chooser was already configured for directories before this change;
  the user's original file-click symptom has not been reproduced physically.
  The [File System Access API](https://wicg.github.io/file-system-access/#api-showdirectorypicker)
  provides no option to filter the native directory list by an exact folder name.
  Other folders may remain visible in that system dialog, but the editor accepts
  only the validated CIRCUITPY target. No automatic parent traversal or substitute
  target is used.
- Validation: all 48 device tests passed, including six new root-selection cases
  covering file handles, wrong directories, correction after rejection and valid
  root selection without choosing a file. Application TypeScript, targeted ESLint,
  i18n compile/tidy and formatting/diff checks passed. No physical browser/USB test
  was performed; localhost browser automation remains unavailable in this runtime.

## 2026-10-20 — Add BME680 sensor building blocks

Request: add the supplied BME680 snippet under Sensors, split it into useful,
clearly named blocks, and record all changes.

- Added `content/de/sensoren/bme680.md` as “Umweltsensor (BME680)”, with a subtitle
  covering air temperature, relative humidity, pressure and air quality. The
  existing content glob automatically discovers this topic in the Sensors tab;
  no sidebar configuration, routes or theme changes are necessary. German content
  follows the same fallback behavior as the existing sensor topics.
- Split the supplied example into seven entries with explicit, section-unique
  `bme680-…` slugs: initialization, air temperature, relative humidity, pressure,
  gas resistance, optional altitude estimation, and a complete repeating example.
  Each entry has one draggable/copyable Python code block. The topic explains how
  to combine initialization and individual measurements, or use the full example
  alone. Individual measurements expose clearly named German variables and units.
- Preserved `board.I2C()`, I²C address `0x76`, reference pressure `1013.25 hPa` for
  altitude, and the full example's two-second interval. Translated comments and
  output labels. Explained how to reuse an existing `i2c` object when combining
  sensors, rather than setting up the bus repeatedly.
- Named the air-quality measurement precisely as gas resistance in Ohms; the
  provided driver does not calculate a calibrated air-quality index. Kept altitude
  as an optional derived quantity and explained that it needs the region's current
  sea-level reference pressure, whereas the four other properties do not depend
  on that altitude calibration. Units/properties were checked against the primary
  [Adafruit BME680 API documentation](https://docs.circuitpython.org/projects/bme680/en/stable/api.html).
- `adafruit_bme680` version 3.7.16 and its `adafruit_bus_device` dependency are
  already in the pinned catalog. The new import therefore uses the existing
  automatic library installation without changing library assets or the transfer
  code. No connection, filesystem, firmware, analytics, or unrelated sensor content
  was changed. The new Markdown source includes the project licensing notice.

Validation:

- All 13 existing bundled-content and library-resolver/asset-integrity tests passed.
- Ran the actual Markdown topic parser against the new file: topic name, all seven
  entries, unique expected slugs, and a Python block for each entry were verified.
- Python parsed all seven snippets. Executed the modular combination and one loop
  iteration of the complete example using simulated board/sensor/time modules:
  address `0x76`, all five output values/units, reference pressure and the two-second
  sleep were verified. No Python sensor imports or USB writes were performed on a
  real board. A physical BME680 measurement test was not performed.
- Production build passed and includes the new `bme680` content chunk. Targeted
  Prettier and `git diff --check` passed. Build warnings were the existing large
  JavaScript chunk notice and a sandbox-blocked Panda update-config check; code
  generation and bundling completed successfully.

## 2026-10-21 — Windows transfer flush and senseBox serial filtering

- The Web Serial chooser now filters for the senseBox MCU-S2 USB vendor ID
  (`0x303a`) and its three application product IDs (`0x81b8`, `0x81b9`,
  `0x81ba`). The vendor follows the senseBox flash tool while the product IDs
  narrow this editor's chooser to senseBox firmware variants, hiding unrelated
  Espressif, serial, Bluetooth and modem devices.
- The loopback-only Vite transfer helper is now enabled on Windows as well as
  Linux. Windows has no `/proc/mountinfo`, so the helper probes drive roots and
  accepts exactly one drive whose complete `boot_out.txt` matches the
  browser-selected CIRCUITPY volume. It never accepts a browser-supplied path.
- On Windows the helper verifies every changed file's size and SHA-256, rejects
  links and ambiguous matching boards, then calls the host file flush primitive.
  Linux retains its VFAT mount checks and file-plus-directory flush ordering.
- The helper acknowledgement remains only a cache-visibility acceleration. The
  transfer still waits for CircuitPython itself to report matching lengths and
  checksums, restores the normal REPL prompt, and only then requests restart.

Windows host validation:

- The attached board was identified as `CIRCUITPY` on `D:` (FAT) and as
  `VID_303A&PID_81B9` on `COM8`; unrelated Intel, Bluetooth and USB serial ports
  were present on the same host and are excluded by the new picker filters.
- A physical-drive smoke test resolved `D:` through the production Windows
  discovery path, verified the existing 750-byte `code.py`, flushed it and read
  back identical bytes. The test did not modify the board file. Targeted device,
  host-flush and middleware tests passed (77 passed; one file-symlink case skipped
  because Windows Developer Mode is disabled).
- The Playwright browser tests could not start on this host because the configured
  Chromium headless-shell binary is not installed. No physical browser transfer
  was claimed.

## 2026-10-21 — Accept Windows drive-root directory handles

- Chromium can return a Windows drive root selected in `showDirectoryPicker()`
  with a handle name such as `D:` instead of its Explorer volume label
  `CIRCUITPY`. The prior exact-name check rejected that valid selection and left
  the directory dialog open with the wrong-directory message.
- Directory selection now accepts either the `CIRCUITPY` volume label or a
  Windows drive-root name. It still requires a directory containing a readable
  `boot_out.txt` that identifies CircuitPython; ordinary folders and files remain
  rejected before any project write.
- The local host-flush request now sends the validated semantic volume identity
  `CIRCUITPY`, rather than the platform-specific handle name, so the Windows
  helper can locate and flush the selected board after the dialog closes.
- Unit coverage includes both `D:` and `d:\\` handle names plus request
  normalization; the targeted device, host-flush and middleware suites pass with
  80 tests (one Windows file-symlink case skipped). A browser regression also
  checks that selecting a `D:` handle closes the dialog and continues transfer.
- The browser suite was run with the installed system Chrome. The Windows
  drive-root regression and all non-library transfer scenarios passed. The
  bundled Playwright Chromium remains unavailable on this host.

## 2026-10-21 — Separate directory selection from code transfer

- The lower action area now has two independent CircuitPython controls. Selecting
  the CIRCUITPY directory invokes only the native directory picker and stores the
  validated handle. It never starts a transfer. The adjacent transfer button is
  disabled until that selection succeeds.
- `Code übertragen` no longer opens or returns to an intermediate application
  dialog. It operates only on the already selected directory. Invalid selection
  feedback is shown through the existing device-error notification, and the user
  can retry with the directory button.
- The old `CircuitPythonDirectoryDialog` and its unused explanatory strings were
  removed. Browser coverage now selects the directory before transfer and checks
  that a Windows `D:` root enables the separate transfer button.
- Windows does not expose a stable drive-root handle name in every Chromium
  version and picker view. Directory identity now relies on the readable
  CircuitPython `boot_out.txt` marker instead of the shell display name. The UI
  stores the result in React state explicitly, so a successful selection always
  enables the transfer button and disconnect/write failures disable it again.
- Targeted device, host-flush and middleware tests pass (82 passed, one skipped),
  as do TypeScript, targeted ESLint, formatting and diff checks.

## 2026-10-21 — Normalize Windows library-asset line endings

- Git checked the generated one-line library payloads out with a final CRLF on
  Windows, while their pinned SHA-256 values were generated from the original LF
  bytes. Integrity verification therefore rejected the first required dependency,
  commonly `adafruit_bus_device`, before any board file was changed.
- The browser loader now canonicalizes only a final CRLF to LF before checking the
  payload digest and parsing it. All other byte changes still fail verification;
  the individual decoded library files retain their own SHA-256 checks.
- `.gitattributes` pins the generated catalog and payload JSON to LF for future
  checkouts; runtime normalization also repairs existing Windows working trees.
- The complete payload-integrity suite now passes on the Windows checkout. A
  dedicated CRLF regression test passes, and both automatic-library scenarios
  pass in the installed Windows system Chrome, including dependency/resource
  installation before `code.py` and failure without partial board writes.
