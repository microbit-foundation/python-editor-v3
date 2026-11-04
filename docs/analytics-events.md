# Analytics events

Analytics events emitted by the app. The catalogue is aligned with
ml-trainer's `docs/analytics-events.md` so the two apps can share GA4 custom
definitions where the concept matches; the "Removed / migrated events" table
at the end maps the previous UA-shaped events to their replacements.

## User properties

Set once on app boot. Auto-attach to every subsequent event for the same user,
available as user-scoped breakdowns in GA4.

| Name               | Values       | Set when | Notes                                                          |
| ------------------ | ------------ | -------- | -------------------------------------------------------------- |
| `webusb_available` | `yes` / `no` | App boot | From `"usb" in navigator`. Same name and values as ml-trainer. |

Unlike ml-trainer there is no `webbluetooth_available`: the editor doesn't use
Bluetooth.

## Device events

Same event family and params as ml-trainer so a cross-product device dashboard
works with one set of custom definitions. The editor has no connection state
machine, so the step set is small and there are no `from` / `via` params.

Every `device_*` event carries:

- **`task`** — `connect` (the user pressed Connect, or a flash needed a
  connection first) or `download` (the user pressed Send to micro:bit and a
  flash was attempted). `connect` is deliberately not ml-trainer's
  `data_connection`: there it means live sensor data for recording, here it
  means serial / REPL plus fast flashing.
- **`transport`** — always `web_usb`. A new value alongside ml-trainer's
  `web_bluetooth` / `native_bluetooth` / `radio`; describes the user's setup,
  consistent with how ml-trainer uses it on `download` events.

Browsers without WebUSB can't use the connect flow at all. We emit no
`device_*` events for that cohort; the `webusb_available` user property
captures the segment.

### `device_step`

| Param       | Values                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `task`      | `connect` / `download`                                                                                                              |
| `step`      | `connect_help` (the connect help dialog was shown), `connecting` (WebUSB chooser / connect in progress), `flashing` (flash started) |
| `transport` | `web_usb`                                                                                                                           |

### `device_success`

| Param          | Values                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `task`         | `connect` / `download`                                                                                          |
| `transport`    | `web_usb`                                                                                                       |
| `duration_ms`  | int — wall-clock flash time (download task only). Revives the dead `WebUSB-time` event as a raw metric.         |
| `files`        | int — files in the project (download task only)                                                                 |
| `lines`        | int — line count of `main.py` (download task only)                                                              |
| `is_default`   | boolean — `main.py` is still the unedited starter program (download task only)                                  |
| `storage_used` | int — bytes of micro:bit filesystem used (download task only)                                                   |
| `errors`       | int — diagnostics the language server currently reports (download task only)                                    |
| `modules`      | int — files carrying our module metadata header, i.e. modules added from Reference / Ideas (download task only) |

The project stats params are the same set as `project_save`, so "what does a
typical program look like when it reaches a micro:bit" is one query.

### `device_failure`

| Param       | Values                                                                                                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task`      | `connect` / `download`                                                                                                                                                                                                |
| `at_step`   | `connecting` / `flashing`                                                                                                                                                                                             |
| `code`      | `DeviceError` code: `no-device-selected`, `device-disconnected`, `firmware-update-required`, `device-in-use`, `timeout`, `connection-error`, `unsupported`; `flash-data` for a hex build failure; `unknown` otherwise |
| `transport` | `web_usb`                                                                                                                                                                                                             |

### `device_exit`

User pressed Cancel on the connect help dialog.

| Param       | Values                 |
| ----------- | ---------------------- |
| `task`      | `connect` / `download` |
| `at_step`   | `connect_help`         |
| `reason`    | `close`                |
| `transport` | `web_usb`              |

### `device_disconnect`

| Param       | Values                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `reason`    | `user` (Disconnect button) / `unknown` (status went from connected to disconnected or unauthorised otherwise, e.g. unplugged) |
| `transport` | `web_usb`                                                                                                                     |

## Project events

### `project_save`

User saved from the project Save menu. Both variants prompt for a project name
first.

| Param                                                               | Values                                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `format`                                                            | `hex` (Save hex: whole project plus MicroPython) / `py` (Save Python script: `main.py` only) |
| `files`, `lines`, `is_default`, `storage_used`, `errors`, `modules` | As on `device_success`.                                                                      |

No `destination` param: the editor only downloads. ml-trainer's
`destination: download | share` distinguishes its native share sheet.

### `project_import`

User brought files in. Fires once per drop / picker selection, before the
files are parsed, so it counts attempts.

| Param    | Values                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `source` | `drop` / `file_picker` (same values as ml-trainer)                                                                                         |
| `format` | `hex` (replaces the project) / `py` (Python file added to the project) / `other` (any other single file) / `multiple` (more than one file) |

### `project_reset`

User chose Reset project, replacing everything with the starter program. Fires
when the menu action is chosen, before the confirm dialog. No params.

### `project_rename`

User set the project name, from the header or the name-your-project prompt on
save. No params.

### `idea_open`

User opened an idea into the editor.

| Param | Values                     |
| ----- | -------------------------- |
| `id`  | The idea slug, e.g. `dice` |

## File events

Per-file actions from the Project (files) area.

| Event         | Params | When fired                                              |
| ------------- | ------ | ------------------------------------------------------- |
| `file_create` | —      | User created a new file                                 |
| `file_delete` | —      | User chose delete on a file (before the confirm dialog) |
| `file_save`   | —      | User downloaded a single file from the files list       |

## Documentation events

The Reference / Ideas / API sidebar. Page views for each documentation page are
already auto-collected via `page_view` because navigation uses `pushState`;
these events add the _how_.

### `docs_navigate`

Fires on programmatic navigation into a documentation page. Browser
back/forward and typed URLs don't fire it (they are `page_view` only).

| Param     | Values                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `via`     | `user` (clicked in the sidebar), `search` (picked a search result), `code` (from a code hover/help link), `simulator` (from the simulator) |
| `surface` | The sidebar section id from `content/sidebar.json` (for example `text`)                                                                    |
| `id`      | The page slug, e.g. `buttons`; absent when navigating to a tab root                                                                        |

### `docs_search`

Fires once per search session: when results first appear after typing, not
per keystroke (300ms debounce) and not again until results are cleared. No
params. Search terms are deliberately not sent.

## Code snippet events

Moving code from the documentation into the editor. Drag and copy are the
starts; drop and paste are the completions, so drop ÷ drag is the drag-and-drop
success rate.

| Event        | Params          | When fired                                                                  |
| ------------ | --------------- | --------------------------------------------------------------------------- |
| `code_drag`  | `surface`, `id` | User started dragging a snippet from the sidebar                            |
| `code_drop`  | `surface`, `id` | The snippet landed in the editor                                            |
| `code_copy`  | `surface`, `id` | User used the snippet's copy button                                         |
| `code_paste` | `surface`, `id` | A copied snippet was pasted into the editor (via our own clipboard context) |

- `surface` — `reference` (snippets in a section with the reference layout),
  `ideas` (snippets in a section with the cards layout) or `api`.
- `id` — the documentation slug for sections, or the fully qualified
  name for API (e.g. `microbit.display.scroll`). Bounded cardinality, but
  large; expect `(other)` in standard reports and use Explorations.

## Editor events

The CodeMirror code editor.

| Event                 | Params                 | When fired                                                                                |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `editor_paste`        | `count:int`            | Text pasted from outside the app (not a snippet paste). `count` is the pasted line count. |
| `editor_undo`         | —                      | Undo via the toolbar (keyboard undo is not tracked)                                       |
| `editor_redo`         | —                      | Redo via the toolbar                                                                      |
| `editor_zoom`         | `direction: in \| out` | Font size changed via the zoom buttons                                                    |
| `editor_autocomplete` | —                      | User accepted an autocomplete suggestion                                                  |

## Serial events

The serial / REPL panel.

| Event              | Params                      | When fired                                                                            |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| `serial_toggle`    | `state: expand \| collapse` | User expanded or collapsed the serial area                                            |
| `serial_help`      | —                           | User opened the serial hints and tips                                                 |
| `serial_interrupt` | —                           | User sent Ctrl-C                                                                      |
| `serial_reset`     | —                           | User sent Ctrl-D                                                                      |
| `serial_traceback` | —                           | A MicroPython traceback arrived from the device (first one per run; cleared on reset) |

## Simulator events

| Event          | Params                  | When fired                                                                                                                                                                                                                                      |
| -------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sim_start`    | —                       | User ran the program in the simulator                                                                                                                                                                                                           |
| `sim_stop`     | —                       | User pressed stop (stops caused by code changes are not counted)                                                                                                                                                                                |
| `sim_reset`    | —                       | User pressed reset                                                                                                                                                                                                                              |
| `sim_audio`    | `state: mute \| unmute` | User toggled simulator sound                                                                                                                                                                                                                    |
| `sim_sensor`   | `id`                    | First time in the session the user changed a given input, e.g. `accelerometerX`, `gesture`, `compassHeading`, `pin0`, `pinLogo`, `temperature`, `lightLevel`, `soundLevel`, `buttonA`, `buttonB`, `radio_input`. Once per sensor per page load. |
| `sim_log_save` | —                       | User downloaded the simulated data log as CSV                                                                                                                                                                                                   |

## Layout events

| Event            | Params                 | When fired                             |
| ---------------- | ---------------------- | -------------------------------------- |
| `sidebar_toggle` | `state: open \| close` | User collapsed or expanded the sidebar |

## Removed / migrated events

Migration notes from the previous UA-shaped events. Every old event was sent
with `event_category: "Python Editor V3"`, the message as `event_label`, and
`value` (default 1); none of that survives. Listed for grep-ability when
reading old dashboards.

| Old name                                                                                           | Status                                                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `boot` → `WebUSB-available`                                                                        | Dropped. Replaced by the `webusb_available` user property. `session_start` auto-fires.                                                |
| `connect`                                                                                          | Replaced by `device_step` (`task: connect`) and `device_success` / `device_failure` / `device_exit`.                                  |
| `disconnect`                                                                                       | Renamed `device_disconnect`; widened with `reason` to also capture unexpected drops.                                                  |
| `flash` (+ fan-outs `files`, `fs-used`, `lines`, `lines-value`, `code-errors`, `magic-modules`)    | Replaced by `device_step` (`step: flashing`) and `device_success` (`task: download`) with raw numeric params.                         |
| `save` (+ the same fan-outs)                                                                       | Renamed `project_save` with `format: hex` and raw numeric params.                                                                     |
| `save-main-file`                                                                                   | Folded into `project_save` with `format: py`.                                                                                         |
| `save-file`                                                                                        | Renamed `file_save`.                                                                                                                  |
| `create-file` / `delete-file`                                                                      | Renamed `file_create` / `file_delete`.                                                                                                |
| `set-project-name`                                                                                 | Renamed `project_rename`.                                                                                                             |
| `reset-project`                                                                                    | Renamed `project_reset`.                                                                                                              |
| `idea-open`                                                                                        | Renamed `idea_open`; slug moved from label to the `id` param.                                                                         |
| `drop-load` / `file-upload` → `load` with label `<type>-<ext>`                                     | Consolidated to `project_import` with `source` and `format` params.                                                                   |
| `documentation-user` / `-search` / `-from-code` / `-from-simulator` with label `tab-slug`          | Consolidated to `docs_navigate` with `via`, `surface`, `id` params.                                                                   |
| `search`                                                                                           | Renamed `docs_search`.                                                                                                                |
| `code-drag` / `code-drop` / `code-copy` / `code-paste` with label `<toolkit>-<slug>` or `api-<id>` | Same names in snake_case; label split into `surface` and `id` params.                                                                 |
| `paste` (value = line count)                                                                       | Renamed `editor_paste`; line count moved to the `count` param.                                                                        |
| `undo` / `redo`                                                                                    | Renamed `editor_undo` / `editor_redo`.                                                                                                |
| `zoom-in` / `zoom-out`                                                                             | Consolidated to `editor_zoom` with `direction`.                                                                                       |
| `autocomplete-accept`                                                                              | Renamed `editor_autocomplete`.                                                                                                        |
| `sidebar-toggle` with label `open` / `close`                                                       | Renamed `sidebar_toggle`; label moved to the `state` param.                                                                           |
| `serial-expand` / `serial-collapse`                                                                | Consolidated to `serial_toggle` with `state`.                                                                                         |
| `serial-info`                                                                                      | Renamed `serial_help`.                                                                                                                |
| `serial-interrupt` / `serial-reset` / `serial-traceback`                                           | Same names in snake_case.                                                                                                             |
| `sim-user-start` / `sim-user-stopped` / `sim-user-reset`                                           | Renamed `sim_start` / `sim_stop` / `sim_reset`.                                                                                       |
| `sim-user-mute` / `sim-user-unmute`                                                                | Consolidated to `sim_audio` with `state`.                                                                                             |
| `sim-user-<sensorId>`                                                                              | Consolidated to `sim_sensor` with the `id` param.                                                                                     |
| `sim-user-data-log-saved`                                                                          | Renamed `sim_log_save`.                                                                                                               |
| `WebUSB-time`                                                                                      | Was already dead (the emitter went with the connection-library extraction in Feb 2025). Revived as `duration_ms` on `device_success`. |

### CircuitPython / senseBox connection flow

The bottom-left connection button opens the shared Web Serial connection (`task: connect`)
without transferring project files. Cancelling the serial picker does not emit
`device_success`. The lower **Transfer code** button writes project files through
File System Access (`task: download`). The legacy `transport: web_usb` value is
retained for compatibility; it also covers this combination of browser APIs.
CircuitPython `storage_used` is the sum of project file bytes, without HEX padding.
Its statistics do not require loading micro:bit firmware.

CircuitPython failures use the existing `device_failure.code` field with
`unsupported`, `connect`, `not-connected`, `directory`, `wrong-directory`, `write`,
`filesystem-state`, `permission`, `storage-full`, `library`, `sync`, `start` or `repl` where an operation reaches the corresponding tracked step. Folder
selection errors remain in the selection dialog so the user can correct them.
The diagnostic events `webfilesystem-flash` and `webfilesystem-flash-complete`
mark the start and successful completion of file transfer. Completion is reported
after every file has been closed, board-side size/checksum verification has
succeeded and the serial restart command has been sent;
it does not assert that the user's program ran successfully.

File-write error reports include flat diagnostic context `file_name`, `operation`
and `error_name`, without program source. `operation` is `open-file`,
`read-file`, `create-writer`, `write-file` or `close-file`. `NoModificationAllowedError` maps to
`filesystem-state` (read-only drive or file lock), `NotAllowedError` / `SecurityError`
to `permission`, and `QuotaExceededError` to `storage-full`. These same categories
are retained in `device_failure.code`; cleanup failures do not replace the original
exception. The browser alone cannot prove why the OS has made a volume read-only.

A `sync` failure means the host save completed but the board did not acknowledge
matching file lengths and checksums before timeout. It never emits a successful
transfer event or requests a soft restart. The sync check reads project files on
the board without executing them or changing filesystem ownership.

The synchronization check uses Raw REPL with complete execution framing. A `sync`
error may also mean a missing/incomplete raw response or a Python error, whose
cause is retained for diagnosis. On success the device returns to the confirmed
normal REPL before Ctrl-D requests the soft reboot. Raw execution Ctrl-D bytes
are not soft reboots and do not produce separate analytics success events.

The file visibility gate now requires repeated matching reads for at least one
second, restarting that interval after any mismatch, within a 60-second deadline.
A `start` failure means the restart was requested but the first second of console
output contained an immediate, traceback-free `code.py` load error with Errno 5.
It suppresses the completion/success events, retains the directory and does not
retry or rewrite files automatically. Other program errors remain console output;
the short observation does not guarantee successful execution of arbitrary code.

In the local Linux development editor, changed files can be flushed through the
same-origin Vite helper before MCU verification. This adds no analytics event,
step or failure code. Host flush acknowledgement is not transfer completion;
the existing board verification and restart conditions still apply. If the helper
is absent, rejects the request or times out, transfer uses the original visibility
wait. The local request contains selected-directory name, boot marker and file
names/sizes/SHA-256 values; it does not contain program contents or a host path.

Automatic library installation uses the same transfer lifecycle. A `library`
failure means preparing the required library assets failed (including incompatible
CircuitPython major version); it happens before REPL entry or any project/library
writes, and never requests a restart. No extra library analytics events or source
contents are recorded. `storage_used` still counts only user project bytes, not
automatically resolved library assets. The board checksum gate covers both.
