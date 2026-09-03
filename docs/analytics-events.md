# Analytics events

Analytics events emitted by the app. The catalogue is aligned with
ml-trainer's `docs/analytics-events.md` so the two apps can share GA4 custom
definitions where the concept matches; the "Removed / migrated events" table
at the end maps the previous UA-shaped events to their replacements.

## Overview

- The web build emits via gtag. GA4 Enhanced Measurement auto-collects
  `page_view` (including `pushState` navigation between documentation pages),
  `session_start`, `first_visit`, `user_engagement`, etc. Those are not
  redocumented here.
- gtag is only present when `shared-assets/common.js` is loaded, which
  `index.html` does only for Foundation builds (`VITE_FOUNDATION_BUILD`), and
  the script itself is hostname-gated to `*.microbit.org`. Consent is owned by
  the shared-assets cookie modal, which only offers the GA opt-in on
  PRODUCTION / STAGING. OSS forks and local dev therefore send nothing: events
  fall through to the console via the Sentry-breadcrumb fallback.
- Backend code: `src/logging/logger.ts` (param building, Sentry, product
  injection) and `src/logging/sink.ts` (gtag). Shared device-event
  vocabulary and helpers are in `src/logging/analytics.ts`.
- Names are snake_case, ≤40 chars. Param values are primitives (string
  ≤100 chars, number, or boolean). These are Firebase's rules; the editor has
  no native build today but the catalogue is kept compatible so a future one
  could share it.
- Every event automatically carries a **`product`** param (`python-editor`),
  injected by the logger from `BrandConfig.product`. It's not listed on
  individual event tables. Lets dashboards split traffic by product when
  sibling apps share a GA4 property.
- Numeric params (`files`, `lines`, `storage_used`, `errors`, `modules`,
  `duration_ms`) are sent raw and should be registered as GA4 **custom
  metrics**, not dimensions. The UA-era bucketing (`0-5`, `51-100`, …) is gone;
  bucket in the reporting layer if needed.

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
| `default_main` | boolean — `main.py` is still the unedited starter program (download task only)                                  |
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

| Param                                                                 | Values                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `format`                                                              | `hex` (Save hex: whole project plus MicroPython) / `py` (Save Python script: `main.py` only) |
| `files`, `lines`, `default_main`, `storage_used`, `errors`, `modules` | As on `device_success`.                                                                      |

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

| Param  | Values                     |
| ------ | -------------------------- |
| `idea` | The idea slug, e.g. `dice` |

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

| Param  | Values                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `via`  | `user` (clicked in the sidebar), `search` (picked a search result), `code` (from a code hover/help link), `simulator` (from the simulator) |
| `tab`  | `reference` / `ideas` / `api`                                                                                                              |
| `slug` | The page slug, e.g. `buttons`; absent when navigating to a tab root                                                                        |

### `docs_search`

Fires once per search session: when results first appear after typing, not
per keystroke (300ms debounce) and not again until results are cleared. No
params. Search terms are deliberately not sent.

## Code snippet events

Moving code from the documentation into the editor. Drag and copy are the
starts; drop and paste are the completions, so drop ÷ drag is the drag-and-drop
success rate.

| Event        | Params      | When fired                                                                  |
| ------------ | ----------- | --------------------------------------------------------------------------- |
| `code_drag`  | `tab`, `id` | User started dragging a snippet from the sidebar                            |
| `code_drop`  | `tab`, `id` | The snippet landed in the editor                                            |
| `code_copy`  | `tab`, `id` | User used the snippet's copy button                                         |
| `code_paste` | `tab`, `id` | A copied snippet was pasted into the editor (via our own clipboard context) |

- `tab` — `reference` / `ideas` / `api`.
- `id` — the documentation slug for Reference / Ideas, or the fully qualified
  name for API (e.g. `microbit.display.scroll`). Bounded cardinality, but
  large; expect `(other)` in standard reports and use Explorations.

## Editor events

The CodeMirror code editor.

| Event                 | Params                 | When fired                                                                                |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `editor_paste`        | `lines:int`            | Text pasted from outside the app (not a snippet paste). `lines` is the pasted line count. |
| `editor_undo`         | —                      | Undo via the toolbar (keyboard undo is not tracked)                                       |
| `editor_redo`         | —                      | Redo via the toolbar                                                                      |
| `editor_zoom`         | `direction: in \| out` | Font size changed via the zoom buttons                                                    |
| `editor_autocomplete` | —                      | User accepted an autocomplete suggestion                                                  |

## Serial events

The serial / REPL panel.

| Event              | Params                       | When fired                                                                            |
| ------------------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| `serial_toggle`    | `action: expand \| collapse` | User expanded or collapsed the serial area                                            |
| `serial_help`      | —                            | User opened the serial hints and tips                                                 |
| `serial_interrupt` | —                            | User sent Ctrl-C                                                                      |
| `serial_reset`     | —                            | User sent Ctrl-D                                                                      |
| `serial_traceback` | —                            | A MicroPython traceback arrived from the device (first one per run; cleared on reset) |

## Simulator events

| Event          | Params                   | When fired                                                                                                                                                                                                                                      |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sim_start`    | —                        | User ran the program in the simulator                                                                                                                                                                                                           |
| `sim_stop`     | —                        | User pressed stop (stops caused by code changes are not counted)                                                                                                                                                                                |
| `sim_reset`    | —                        | User pressed reset                                                                                                                                                                                                                              |
| `sim_audio`    | `action: mute \| unmute` | User toggled simulator sound                                                                                                                                                                                                                    |
| `sim_sensor`   | `sensor`                 | First time in the session the user changed a given input, e.g. `accelerometerX`, `gesture`, `compassHeading`, `pin0`, `pinLogo`, `temperature`, `lightLevel`, `soundLevel`, `buttonA`, `buttonB`, `radio_input`. Once per sensor per page load. |
| `sim_log_save` | —                        | User downloaded the simulated data log as CSV                                                                                                                                                                                                   |

## Layout events

| Event            | Params                  | When fired                             |
| ---------------- | ----------------------- | -------------------------------------- |
| `sidebar_toggle` | `action: open \| close` | User collapsed or expanded the sidebar |

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
| `idea-open`                                                                                        | Renamed `idea_open`; slug moved from label to the `idea` param.                                                                       |
| `drop-load` / `file-upload` → `load` with label `<type>-<ext>`                                     | Consolidated to `project_import` with `source` and `format` params.                                                                   |
| `documentation-user` / `-search` / `-from-code` / `-from-simulator` with label `tab-slug`          | Consolidated to `docs_navigate` with `via`, `tab`, `slug` params.                                                                     |
| `search`                                                                                           | Renamed `docs_search`.                                                                                                                |
| `code-drag` / `code-drop` / `code-copy` / `code-paste` with label `<toolkit>-<slug>` or `api-<id>` | Same names in snake_case; label split into `tab` and `id` params.                                                                     |
| `paste` (value = line count)                                                                       | Renamed `editor_paste`; line count moved to the `lines` param.                                                                        |
| `undo` / `redo`                                                                                    | Renamed `editor_undo` / `editor_redo`.                                                                                                |
| `zoom-in` / `zoom-out`                                                                             | Consolidated to `editor_zoom` with `direction`.                                                                                       |
| `autocomplete-accept`                                                                              | Renamed `editor_autocomplete`.                                                                                                        |
| `sidebar-toggle` with label `open` / `close`                                                       | Renamed `sidebar_toggle`; label moved to the `action` param.                                                                          |
| `serial-expand` / `serial-collapse`                                                                | Consolidated to `serial_toggle` with `action`.                                                                                        |
| `serial-info`                                                                                      | Renamed `serial_help`.                                                                                                                |
| `serial-interrupt` / `serial-reset` / `serial-traceback`                                           | Same names in snake_case.                                                                                                             |
| `sim-user-start` / `sim-user-stopped` / `sim-user-reset`                                           | Renamed `sim_start` / `sim_stop` / `sim_reset`.                                                                                       |
| `sim-user-mute` / `sim-user-unmute`                                                                | Consolidated to `sim_audio` with `action`.                                                                                            |
| `sim-user-<sensorId>`                                                                              | Consolidated to `sim_sensor` with the `sensor` param.                                                                                 |
| `sim-user-data-log-saved`                                                                          | Renamed `sim_log_save`.                                                                                                               |
| `WebUSB-time`                                                                                      | Was already dead (the emitter went with the connection-library extraction in Feb 2025). Revived as `duration_ms` on `device_success`. |
