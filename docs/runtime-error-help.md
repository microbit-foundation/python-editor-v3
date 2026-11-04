# Runtime error help

The console's **Explain error** action opens local, rule-based explanations of
Python runtime tracebacks in English or German. It works in the compact and
expanded console. Opening the help does not send commands to the board or modify
code. The original error and stack frames remain available in the dialog and
terminal. No error text or program contents are added to analytics.

`src/serial/runtime-error-help.ts` matches exception types and a small set of
explicit hardware error messages. It covers I²C connection messages, occupied
pins, imports, undefined names, indentation and syntax, attributes, types, values,
division by zero, indexes, dictionary keys, memory, missing files, read-only
storage and general I/O. Other messages receive a generic troubleshooting guide.
An arbitrary `OSError`, including Errno 5, is not classified as an I²C failure.
Explanations describe possible causes and checks; they do not diagnose physical
hardware or automatically apply fixes.

Navigation chooses the last stack frame whose file is present in the project,
skipping unavailable library files and invalid line numbers. If the editor has
changed or has not been transferred since connecting, the dialog explains that
the locations may be stale and offers no line jump. A serial reset removes the
explanation and closes its dialog. A later occurrence can be opened separately.

The shared traceback parser accepts LF and CRLF, accumulates split serial
packets, ignores empty pending error lines and retains at most 4096 characters.
It continues to ignore direct REPL errors and `KeyboardInterrupt`.

To extend the feature, add a conservative rule and guide in
`runtime-error-help.ts`, add all guide messages to both `lang/ui.*.json` catalogs,
and test representative messages as well as nearby cases that must not match.
Unit tests cover rules, catalog completeness, frame selection and serial input;
headless browser tests cover translated dialogs, navigation/focus, stale code,
ambiguous I/O errors, fallback and reset. These use a simulated board.
