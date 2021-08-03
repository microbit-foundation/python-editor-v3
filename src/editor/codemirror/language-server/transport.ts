import {
  IJSONRPCData,
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
    const promise = this.transportRequestManager.addRequest(data, null);
    this.worker.postMessage((data as IJSONRPCData).request);
    return promise;
  }
}
