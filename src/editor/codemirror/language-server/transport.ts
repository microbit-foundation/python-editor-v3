import {
  isNotification,
  JSONRPCRequestData,
} from "@open-rpc/client-js/build/Request";
import { Transport } from "@open-rpc/client-js/build/transports/Transport";

/**
 * Transport via a Web Worker postMessage.
 */
export class WorkerTransport extends Transport {
  private listener = (e: MessageEvent) => {
    this.transportRequestManager.resolveResponse(JSON.stringify(e.data));
  };

  constructor(private worker: Worker) {
    super();
  }

  async connect(): Promise<any> {
    this.worker.addEventListener("message", this.listener);
  }

  close(): void {
    this.worker.removeEventListener("message", this.listener);
  }

  async sendData(
    data: JSONRPCRequestData,
    timeout?: number | null
  ): Promise<any> {
    if (Array.isArray(data)) {
      throw new Error("Batching not supported.");
    }
    if (isNotification(data)) {
      // Bypass the leaky transport request manager for notifications.
      // We don't care about the result and our I/O can't fail.
      // See https://github.com/open-rpc/client-js/issues/294
      this.worker.postMessage(data.request);
    } else {
      const promise = this.transportRequestManager.addRequest(
        data,
        timeout ?? null
      );
      this.worker.postMessage(data.request);
      return promise;
    }
  }
}
