/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import EventEmitter from "events";
import { Sensor } from "../simulator/model";
import {
  ConnectionStatus,
  DeviceConnection,
  EVENT_FLASH,
  EVENT_SERIAL_DATA,
  EVENT_STATUS,
  FlashDataSource,
} from "./device";

export const EVENT_SENSORS = "sensors";

/**
 * A simulated device.
 *
 * This communicates with the iframe that is used to embed the simulator.
 */
export class SimulatorDeviceConnection
  extends EventEmitter
  implements DeviceConnection
{
  status: ConnectionStatus = ConnectionStatus.NO_AUTHORIZED_DEVICE;
  sensors: Record<string, Sensor> = {};

  private messageListener = (event: MessageEvent) => {
    const iframe = this.iframe();
    if (!iframe || event.source !== iframe.contentWindow || !event.data.kind) {
      // Not an event for us.
      return;
    }

    switch (event.data.kind) {
      case "ready": {
        // We get this in response to flash as well as at start-up.
        this.sensors = sensorsById(event);
        this.emit(EVENT_SENSORS, this.sensors);
        if (this.status !== ConnectionStatus.CONNECTED) {
          this.setStatus(ConnectionStatus.CONNECTED);
        }
        break;
      }
      case "sensor_change": {
        this.sensors = sensorsById(event);
        this.emit(EVENT_SENSORS, this.sensors);
        break;
      }
      case "serial_output": {
        const text = event.data.data;
        if (typeof text === "string") {
          this.emit(EVENT_SERIAL_DATA, text);
        }
        break;
      }
      default: {
        // Ignore unknown message.
      }
    }
  };

  constructor(private iframe: () => HTMLIFrameElement | null) {
    super();
  }

  async initialize(): Promise<void> {
    window.addEventListener("message", this.messageListener);
    this.setStatus(ConnectionStatus.NOT_CONNECTED);
  }

  dispose() {
    this.removeAllListeners();
    window.removeEventListener("message", this.messageListener);
  }

  async connect(): Promise<ConnectionStatus> {
    this.setStatus(ConnectionStatus.CONNECTED);
    return this.status;
  }

  async flash(
    dataSource: FlashDataSource,
    options: {
      partial: boolean;
      progress: (percentage: number | undefined) => void;
    }
  ): Promise<void> {
    this.postMessage("flash", {
      filesystem: await dataSource.files(),
    });
    options.progress(undefined);
    this.emit(EVENT_FLASH);
  }

  async disconnect(): Promise<void> {
    window.removeEventListener("message", this.messageListener);
    this.setStatus(ConnectionStatus.NOT_CONNECTED);
  }

  async serialWrite(data: string): Promise<void> {
    this.postMessage("serial_input", {
      data,
    });
  }

  sensorWrite = async (id: string, value: number): Promise<void> => {
    this.postMessage("sensor_set", {
      sensor: id,
      value,
    });
  };

  stop = async (): Promise<void> => {
    this.postMessage("stop", {});
  };

  reset = async (): Promise<void> => {
    this.postMessage("reset", {});
  };

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.emit(EVENT_STATUS, this.status);
  }

  clearDevice(): void {
    this.setStatus(ConnectionStatus.NO_AUTHORIZED_DEVICE);
  }

  private postMessage(kind: string, data: any): void {
    const iframe = this.iframe();
    if (!iframe) {
      throw new Error("Missing simulator iframe.");
    }
    iframe.contentWindow!.postMessage(
      {
        kind,
        ...data,
      },
      "*"
    );
  }
}

const sensorsById = (event: Event & { data: any }) =>
  Object.fromEntries(
    event.data.sensors.map((json: Sensor) => {
      return [json.id, json];
    })
  );
