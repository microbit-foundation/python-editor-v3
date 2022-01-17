/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReferenceToolkit } from "./reference/ReferenceToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";
import { useToolkitState } from "./ToolkitProvider";

const ReferenceArea = () => {
  const { referenceToolkit } = useToolkitState();
  return referenceToolkit ? (
    <ReferenceToolkit docs={referenceToolkit} />
  ) : (
    <ToolkitSpinner />
  );
};

export default ReferenceArea;
