import EventEmitter from "events";
import { NullLogging } from "../deployment/default/logging";
import { Logging } from "../logging/logging";
import {
  ConnectOptions,
  ConnectionStatus,
  DeviceConnection,
  FlashDataSource,
} from "./device";

/**
 * A WebFileSystem connection to a circuitpython device.
 */
export class WebFileSystemConnection
  extends EventEmitter
  implements DeviceConnection
{
  status: ConnectionStatus = ConnectionStatus.NOT_CONNECTED;

  private logging: Logging;
  private directoryHandle: FileSystemDirectoryHandle | undefined;

  constructor(options: { logging: Logging } = { logging: new NullLogging() }) {
    super();
    this.logging = options.logging;
  }

  async initialize(): Promise<void> {
    // this.directoryHandle = await window.showDirectoryPicker();
    this.logging.event({ type: "webfilesystem-initialize" });
  }
  dispose(): void {
    this.logging.event({ type: "webfilesystem-dispose" });
  }
  async connect(
    _options?: ConnectOptions | undefined
  ): Promise<ConnectionStatus> {
    this.directoryHandle = await window.showDirectoryPicker();
    this.status = ConnectionStatus.CONNECTED;
    return this.status;
  }
  async flash(
    dataSource: FlashDataSource,
    _options: {
      partial: boolean;
      progress: (percentage: number | undefined, partial: boolean) => void;
    }
  ): Promise<void> {
    this.logging.event({ type: "webfilesystem-flash" });
    // Wait for the directory to be initialized
    while (!this.directoryHandle) {
      await this.initialize();
    }
    const content = await dataSource.files();

    for (const [fileName, fileContent] of Object.entries(content)) {
      const fileHandle = await this.directoryHandle.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(fileContent);
      await writable.close();
    }
    this.logging.event({ type: "webfilesystem-flash-complete" });
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  serialWrite(_data: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  clearDevice(): void {
    throw new Error("Method not implemented.");
  }
}
