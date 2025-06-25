/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoardVersion,
  ConnectionStatus,
  ConnectionStatusEvent,
  DeviceConnectionEventMap,
  FlashEvent,
  MicrobitWebUSBConnection,
  SerialConnectionEventMap,
  SerialDataEvent,
  SerialResetEvent,
  TypedEventTarget,
} from "@microbit/microbit-connection";
import { Logging } from "../logging/logging";

// Simulator-only events.

export class LogDataEvent extends Event {
  constructor(public readonly log: DataLog) {
    super("log_data");
  }
}

export class RadioDataEvent extends Event {
  constructor(public readonly text: string) {
    super("radio_data");
  }
}

export class RadioGroupEvent extends Event {
  constructor(public readonly group: number) {
    super("radio_group");
  }
}

export class RadioResetEvent extends Event {
  constructor() {
    super("radio_reset");
  }
}

export class StateChangeEvent extends Event {
  constructor(public readonly state: SimulatorState) {
    super("state_change");
  }
}

export class RequestFlashEvent extends Event {
  constructor() {
    super("request_flash");
  }
}

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

class SimulatorEventMap extends DeviceConnectionEventMap {
  "log_data": LogDataEvent;
  "radio_data": RadioDataEvent;
  "radio_group": RadioGroupEvent;
  "radio_reset": RadioResetEvent;
  "state_change": StateChangeEvent;
  "request_flash": RequestFlashEvent;
}

/**
 * A simulated device.
 *
 * This communicates with the iframe that is used to embed the simulator.
 */
export class SimulatorDeviceConnection
  extends TypedEventTarget<SimulatorEventMap & SerialConnectionEventMap>
  implements MicrobitWebUSBConnection
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
        const newState = event.data.state;
        this.state = newState;
        this.dispatchTypedEvent("state_change", new StateChangeEvent(newState));
        if (this.status !== ConnectionStatus.CONNECTED) {
          this.setStatus(ConnectionStatus.CONNECTED);
        }
        break;
      }
      case "request_flash": {
        this.dispatchTypedEvent("request_flash", new RequestFlashEvent());
        this.logging.event({
          type: "sim-user-start",
        });
        break;
      }
      case "state_change": {
        const updated = {
          ...this.state,
          ...event.data.change,
        };
        this.state = updated;
        this.dispatchTypedEvent("state_change", new StateChangeEvent(updated));
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
          this.dispatchTypedEvent("radio_data", new RadioDataEvent(text));
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
        this.dispatchTypedEvent("log_data", new LogDataEvent(this.log));
        break;
      }
      case "log_delete": {
        this.log = initialDataLog();
        this.dispatchTypedEvent("log_data", new LogDataEvent(this.log));
        break;
      }
      case "serial_output": {
        const text = event.data.data;
        if (typeof text === "string") {
          this.dispatchTypedEvent("serialdata", new SerialDataEvent(text));
        }
        break;
      }
      case "internal_error": {
        const error = event.data.error;
        this.logging.error(error);
        break;
      }
      default: {
        // Ignore unknown message.
      }
    }
  };

  constructor(
    private logging: Logging,
    private iframe: () => HTMLIFrameElement | null,
    private sensorsLogged: Record<string, boolean> = {}
  ) {
    super();
  }

  private logSensor(sensorId: string): void {
    if (!this.sensorsLogged[sensorId]) {
      this.logging.event({
        type: `sim-user-${sensorId}`,
      });
      this.sensorsLogged[sensorId] = true;
    }
  }

  async initialize(): Promise<void> {
    window.addEventListener("message", this.messageListener);
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  dispose() {
    window.removeEventListener("message", this.messageListener);
  }

  async connect(): Promise<ConnectionStatus> {
    this.setStatus(ConnectionStatus.CONNECTED);
    return this.status;
  }

  getBoardVersion(): BoardVersion | undefined {
    return "V2";
  }

  /**
   * The simulator doesn't support flash from a hex file.
   *
   * Instead you simply specify the files in the file system.
   *
   * @param filesystem A map from file name to file data.
   */
  async flashFileSystem(filesystem: Record<string, Uint8Array>): Promise<void> {
    this.postMessage("flash", {
      filesystem,
    });
    this.notifyResetComms();
    this.dispatchTypedEvent("flash", new FlashEvent());
  }

  configure(config: Config): void {
    this.postMessage("config", config);
  }

  private notifyResetComms() {
    // Might be nice to rework so this was all about connection state changes.
    this.dispatchTypedEvent("serialreset", new SerialResetEvent());
    this.dispatchTypedEvent("radio_reset", new RadioResetEvent());
  }

  async disconnect(): Promise<void> {
    window.removeEventListener("message", this.messageListener);
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  async serialWrite(data: string): Promise<void> {
    this.postMessage("serial_input", {
      data,
    });
  }

  radioSend(message: string) {
    const kind = "radio_input";
    const data = new TextEncoder().encode(message);
    const prefixed = new Uint8Array(3 + data.length);
    prefixed.set([1, 0, 1]);
    prefixed.set(data, 3);
    this.postMessage(kind, { data: prefixed });
    this.logSensor(kind);
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
    this.dispatchTypedEvent("state_change", new StateChangeEvent(this.state));
    this.postMessage("set_value", {
      id,
      value,
    });
    this.logSensor(id);
  };

  stop = async (): Promise<void> => {
    this.postMessage("stop", {});
  };

  reset = async (): Promise<void> => {
    this.postMessage("reset", {});
    this.notifyResetComms();
    this.logging.event({
      type: "sim-user-reset",
    });
  };

  mute = async (): Promise<void> => {
    this.postMessage("mute", {});
    this.logging.event({
      type: "sim-user-mute",
    });
  };

  unmute = async (): Promise<void> => {
    this.postMessage("unmute", {});
    this.logging.event({
      type: "sim-user-unmute",
    });
  };

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.dispatchTypedEvent("status", new ConnectionStatusEvent(newStatus));
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

  getDeviceId(): number | undefined {
    return undefined;
  }
  setRequestDeviceExclusionFilters(): void {}
  async flash(): Promise<void> {}
  getDevice() {}
  async softwareReset(): Promise<void> {}
}
