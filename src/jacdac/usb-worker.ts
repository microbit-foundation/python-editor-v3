/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// Bundled by Vite into a module worker. Hosts microbit-connection's whole
// USB stack (CMSIS-DAP, flashing, serial, Jacdac exchange pump) off the main
// thread so UI rendering can't starve its timing-sensitive poll loops.
import "@microbit/microbit-connection/usb/worker";
