/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { JDBus } from "jacdac-ts";
import type { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import { MicrobitConnectionTransport } from "./microbit-connection-transport";

/**
 * Create the single Jacdac bus for the app, wired to the app's existing
 * shared USB connection.
 *
 * Streaming stays OFF: we only need device/service discovery (inbound
 * announcements). Enabling streaming makes jacdac-ts continuously request
 * samples from every reading register, flooding the worker-hosted exchange
 * pump with outbound frames and progressively starving its poll loop. We
 * never read live sensor values off the real board (the simulator runs the
 * user's code), so there's nothing to stream.
 */
export const createJacdacBus = (connection: MicrobitUSBConnection): JDBus => {
  const bus = new JDBus([new MicrobitConnectionTransport(connection)], {
    client: true,
  });
  bus.streaming = false;
  return bus;
};
