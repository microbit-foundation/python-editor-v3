import * as TPyParser from "tigerpython-parser";

TPyParser.setLanguage("en");
TPyParser.rejectDeadCode = true;
TPyParser.strictCode = true;

/* eslint-disable no-restricted-globals */
const ctx: Worker = self as any;

ctx.onmessage = (event: MessageEvent) => {
  const errors = TPyParser.findAllErrors(event.data);
  ctx.postMessage(
    errors.map((error: any) => ({
      offset: error.offset,
      line: error.line,
      msg: error.msg,
    }))
  );
};
