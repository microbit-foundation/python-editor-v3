/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiToolkit } from "./api/ApiToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";
import { useToolkitState } from "./toolkit-hooks";

const ApiArea = () => {
  const { apiToolkit } = useToolkitState();
  return apiToolkit ? <ApiToolkit docs={apiToolkit} /> : <ToolkitSpinner />;
};

export default ApiArea;
