/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ConnectionState, Transport } from "jacdac-ts";
import {
  ConnectionStatus,
  type BackgroundErrorData,
  type ConnectionStatusChange,
} from "@microbit/microbit-connection";
import type {
  JacdacFrameData,
  MicrobitUSBConnection,
} from "@microbit/microbit-connection/usb";

export const MICROBIT_CONNECTION = "microbit-connection";

/**
 * jacdac-ts transport over @microbit/microbit-connection's Jacdac frame
 * channel (jacdacframe / sendJacdacFrame).
 *
 * The app owns the USB connection lifecycle (the "Connect" button drives
 * device.connect()/disconnect()). The connection library, in turn, owns the
 * Jacdac exchange pump: it starts it on connect and stops it on disconnect
 * whenever a jacdacframe listener is attached. So this transport is a passive
 * mirror — it keeps the frame channel attached and only reflects the
 * connection's status into jacdac-ts's own transport state. It must NEVER
 * connect/disconnect the shared connection (which also carries flashing and
 * serial), and there must be exactly ONE thing driving this sync (here) to
 * avoid racing jacdac-ts's connect/disconnect on rapid reconnects.
 */
export class MicrobitConnectionTransport extends Transport {
  constructor(readonly connection: MicrobitUSBConnection) {
    super(MICROBIT_CONNECTION, {});
    // Permanent frame channel: the library keys the pump off this listener +
    // the connection state, so we leave it attached for the connection's life.
    connection.addEventListener("jacdacframe", this.frameListener);
    connection.addEventListener("backgrounderror", this.backgroundErrorListener);
    connection.addEventListener("status", this.statusListener);
  }

  private frameListener = (data: JacdacFrameData) => {
    // The frame channel is permanent, but only feed jacdac-ts while we're
    // connected. handleFrame doesn't gate on state, so without this, frames
    // buffered in the worker->main queue would be processed (re-adding devices)
    // after a disconnect.
    if (this.connectionState === ConnectionState.Connected) {
      this.handleFrame(data.frame);
    }
  };

  private backgroundErrorListener = (data: BackgroundErrorData) => {
    if (data.event !== "jacdacframe") return;
    // e.g. code "jacdac-missing" when the program has no Jacdac stack, or the
    // pump dying mid-session.
    this.errorHandler("jacdacframe", data.error);
    if (this.connectionState !== ConnectionState.Disconnected) {
      this.disconnect(true).catch(() => {});
    }
  };

  private statusListener = (change: ConnectionStatusChange) => {
    // Mirror the app-owned connection state into jacdac-ts. By the time the
    // connection reports Connected the pump is already running, so frames are
    // flowing; connecting the transport just lets handleFrame process them.
    if (change.status === ConnectionStatus.Connected) {
      if (this.connectionState !== ConnectionState.Connected) {
        this.connect().catch(() => {});
      }
    } else if (
      change.status === ConnectionStatus.Disconnected ||
      change.status === ConnectionStatus.NoAuthorizedDevice
    ) {
      if (this.connectionState !== ConnectionState.Disconnected) {
        this.disconnect(true).catch(() => {});
      }
    }
  };

  protected async transportConnectAsync(): Promise<void> {
    // No-op: the app owns connecting the underlying connection, and the
    // library starts the pump. Nothing to do but flip jacdac-ts state.
  }

  protected async transportSendPacketAsync(frame: Uint8Array): Promise<void> {
    try {
      await this.connection.sendJacdacFrame(frame);
    } catch (e) {
      // Datagram semantics: sends racing a disconnect aren't fatal.
      console.debug("[jacdac-usb] send failed", e);
    }
  }

  protected async transportDisconnectAsync(): Promise<void> {
    // Leave the shared connection and the frame listener alone (the app owns
    // them). But drop our devices now: the board is gone, so there's no point
    // waiting for jacdac-ts's per-device lost timeout (the 4->3->2->1->0
    // dribble). The gated frameListener stops any buffered frames re-adding them.
    const bus = this.bus;
    if (bus) {
      bus
        .devices({ ignoreInfrastructure: true })
        .forEach((d) => bus.removeDevice(d.deviceId));
    }
  }

  dispose() {
    super.dispose();
    this.connection.removeEventListener("jacdacframe", this.frameListener);
    this.connection.removeEventListener(
      "backgrounderror",
      this.backgroundErrorListener
    );
    this.connection.removeEventListener("status", this.statusListener);
  }
}
