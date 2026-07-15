/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useMemo } from "react";
import { ApiDocumentation } from "./api/ApiDocumentation";
import { mergeJacdacModules } from "./api/apidocs-util";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";

const ApiArea = () => {
  const { api } = useDocumentation();
  // Group the per-sensor Jacdac modules into one "Jacdac" section — display only
  // (a shallow clone so the shared content, used by search, stays unmerged).
  const docs = useMemo(() => {
    if (!api) {
      return undefined;
    }
    const merged = { ...api, content: { ...api.content } };
    mergeJacdacModules(merged);
    return merged.content;
  }, [api]);
  return docs ? <ApiDocumentation docs={docs} /> : <Spinner />;
};

export default ApiArea;
