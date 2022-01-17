/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReferenceToolkit } from "./reference/ReferenceToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";
import { useApiDocs } from "./documentation-hooks";

const ReferenceArea = () => {
  const apidocs = useApiDocs();
  return apidocs ? <ReferenceToolkit docs={apidocs} /> : <ToolkitSpinner />;
};

export default ReferenceArea;
