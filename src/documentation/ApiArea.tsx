/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiDocumentation } from "./api/ApiDocumentation";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";

const ApiArea = () => {
  const { api } = useDocumentation();
  return api ? <ApiDocumentation docs={api.content} /> : <Spinner />;
};

export default ApiArea;
