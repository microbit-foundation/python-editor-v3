/* eslint-disable */

import * as TPyParser from "tigerpython-parser";

// Fixable if we give this its own tsconfig.
let workerSelf = self as unknown as BroadcastChannel;

workerSelf.onmessage = (event: MessageEvent) => {
  const errors = TPyParser.findAllErrors(event.data);
  workerSelf.postMessage(
    errors.map((error: any) => ({
      offset: error.offset,
      line: error.line,
      msg: error.msg,
    }))
  );
};
