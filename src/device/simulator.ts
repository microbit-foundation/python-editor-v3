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

// Simulator-only events.
export const EVENT_LOG_DATA = "log_data";
export const EVENT_RADIO_DATA = "radio_data";
export const EVENT_RADIO_GROUP = "radio_group";
export const EVENT_RADIO_RESET = "radio_reset";
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

export interface LogEntry {
  headings?: string[];
  data?: string[];
}

export interface SimulatorState {
  radio: RadioState;

  dataLogging: DataLoggingState;

  accelerometerX: RangeSensor;
  accelerometerY: RangeSensor;
  accelerometerZ: RangeSensor;
  gesture: EnumSensor;

  compassX: RangeSensor;
  compassY: RangeSensor;
  compassZ: RangeSensor;
  compassHeading: RangeSensor;

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
  | "compassX"
  | "compassY"
  | "compassZ"
  | "compassHeading"
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

interface Config {
  language: string;
  translations: Record<string, string>;
}

export interface DataLog {
  headings: string[];
  data: DataLogRow[];
}

export interface DataLogRow {
  isHeading?: boolean;
  data: string[];
}

const initialDataLog = (): DataLog => ({
  headings: [],
  data: [],
});

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

  log: DataLog = initialDataLog();

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
          ...event.data.change,
        };
        this.emit(EVENT_STATE_CHANGE, this.state);
        break;
      }
      case "radio_output": {
        // So this is a Uint8Array that may be prefixed with 0, 1, 0 bytes to indicate that it's a "string".
        // Either way we only display strings for now so convert at this layer.
        // If it's really binary data then TextEncoder will put replacement characters in and we'll live with that for now.
        const message = event.data.data;
        const text = new TextDecoder()
          .decode(message)
          // eslint-disable-next-line no-control-regex
          .replace(/^\x01\x00\x01/, "");
        if (message instanceof Uint8Array) {
          this.emit(EVENT_RADIO_DATA, text);
        }
        break;
      }
      case "log_output": {
        const entry: LogEntry = event.data;
        const result: DataLog = {
          headings: entry.headings ?? this.log.headings,
          data: this.log.data,
        };
        // The first row is all-time headings row so don't show the initial set.
        if (entry.headings && this.log.data.length > 0) {
          result.data.push({ isHeading: true, data: entry.headings });
        }
        if (entry.data) {
          result.data.push({ data: entry.data });
        }
        this.log = result;
        this.emit(EVENT_LOG_DATA, this.log);
        break;
      }
      case "log_delete": {
        this.log = initialDataLog();
        this.emit(EVENT_LOG_DATA, this.log);
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
    this.notifyResetComms();
    options.progress(undefined);
    this.emit(EVENT_FLASH);
  }

  configure(config: Config): void {
    this.postMessage("config", config);
  }

  private notifyResetComms() {
    // Might be nice to rework so this was all about connection state changes.
    this.emit(EVENT_SERIAL_RESET, {});
    this.emit(EVENT_RADIO_RESET, {});
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

  radioSend(message: string) {
    const data = new TextEncoder().encode(message);
    const prefixed = new Uint8Array(3 + data.length);
    prefixed.set([1, 0, 1]);
    prefixed.set(data, 3);
    this.postMessage("radio_input", { data: prefixed });
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
    this.notifyResetComms();
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
