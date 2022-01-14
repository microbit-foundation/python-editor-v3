/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useEffect, useState } from "react";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { pullModulesToTop } from "./reference/apidocs-util";
import { ReferenceToolkit } from "./reference/ReferenceToolkit";
import ToolkitSpinner from "./ToolkitDocumentation/ToolkitSpinner";

const ReferenceArea = () => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        setApiDocs(docs);
      }
    };
    load();
  }, [client]);
  return apidocs ? <ReferenceToolkit docs={apidocs} /> : <ToolkitSpinner />;
};

export default ReferenceArea;
