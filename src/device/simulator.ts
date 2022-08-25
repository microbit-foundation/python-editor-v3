/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import EventEmitter from "events";
import {
  ConnectionStatus,
  DeviceConnection,
  EVENT_FLASH,
  EVENT_SERIAL_DATA,
  EVENT_SERIAL_RESET,
  EVENT_STATUS,
  FlashDataSource,
} from "./device";

export const EVENT_STATE_CHANGE = "state_change";
export const EVENT_REQUEST_FLASH = "request_flash";

// It'd be nice to publish these types from the simulator project.

export interface RadioState {
  type: "radio";
  enabled: boolean;
  group: number;
}

export interface DataLoggingState {
  type: "dataLogging";
  logFull: boolean;
}

export interface RangeSensor {
  type: "range";
  id: string;
  value: number;
  min: number;
  max: number;
  unit: number;
  lowThreshold?: number;
  highThreshold?: number;
}

export interface EnumSensor {
  type: "enum";
  id: string;
  value: string;
  choices: string[];
}

export type Sensor = RangeSensor | EnumSensor;

export interface SimulatorState {
  radio: RadioState;

  dataLogging: DataLoggingState;

  accelerometerX: RangeSensor;
  accelerometerY: RangeSensor;
  accelerometerZ: RangeSensor;
  gesture: EnumSensor;

  pin0: RangeSensor;
  pin1: RangeSensor;
  pin2: RangeSensor;
  pinLogo: RangeSensor;

  temperature: RangeSensor;
  lightLevel: RangeSensor;
  soundLevel: RangeSensor;

  buttonA: RangeSensor;
  buttonB: RangeSensor;
}

export type SimulatorStateKey = keyof SimulatorState;

export type SensorStateKey = Extract<
  SimulatorStateKey,
  | "accelerometerX"
  | "accelerometerY"
  | "accelerometerZ"
  | "gesture"
  | "pin0"
  | "pin1"
  | "pin2"
  | "pinLogo"
  | "temperature"
  | "lightLevel"
  | "soundLevel"
  | "buttonA"
  | "buttonB"
>;

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
  state: SimulatorState | undefined;

  private messageListener = (event: MessageEvent) => {
    const iframe = this.iframe();
    if (!iframe || event.source !== iframe.contentWindow || !event.data.kind) {
      // Not an event for us.
      return;
    }

    switch (event.data.kind) {
      case "ready": {
        this.state = event.data.state;
        this.emit(EVENT_STATE_CHANGE, this.state);
        if (this.status !== ConnectionStatus.CONNECTED) {
          this.setStatus(ConnectionStatus.CONNECTED);
        }
        break;
      }
      case "request_flash": {
        this.emit(EVENT_REQUEST_FLASH);
        break;
      }
      case "state_change": {
        this.state = {
          ...this.state,
          ...event.data.changes,
        };
        this.emit(EVENT_STATE_CHANGE, this.state);
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
    this.emit(EVENT_SERIAL_RESET, {});
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

  setSimulatorValue = async (
    id: SensorStateKey,
    value: number | string
  ): Promise<void> => {
    if (!this.state) {
      throw new Error("Simulator not ready");
    }
    // We don't get notified of our own changes, so update our state and notify.
    this.state = {
      ...this.state,
      [id]: {
        // Would be good to make this safe.
        ...(this.state as any)[id],
        value,
      },
    };
    this.emit(EVENT_STATE_CHANGE, this.state);
    this.postMessage("set_value", {
      id,
      value,
    });
  };

  stop = async (): Promise<void> => {
    this.postMessage("stop", {});
  };

  reset = async (): Promise<void> => {
    this.postMessage("reset", {});
  };

  mute = async (): Promise<void> => {
    this.postMessage("mute", {});
  };

  unmute = async (): Promise<void> => {
    this.postMessage("unmute", {});
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
