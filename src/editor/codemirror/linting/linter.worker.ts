import * as TPyParser from "tigerpython-parser";

TPyParser.setLanguage("en");
TPyParser.rejectDeadCode = true;
TPyParser.strictCode = true;

/* eslint-disable no-restricted-globals */
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
