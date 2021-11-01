import { Spinner } from "@chakra-ui/spinner";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { AdvancedToolkit } from "./AdvancedTooklit";
import { pullModulesToTop } from "./apidocs-util";

const AdvancedDocumentation = () => {
  const client = useLanguageServerClient();
  const intl = useIntl();
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
  return apidocs ? (
    <AdvancedToolkit docs={apidocs} />
  ) : (
    <Spinner
      display="block"
      ml="auto"
      mr="auto"
      mt={2}
      label={intl.formatMessage({ id: "loading" })}
    />
  );
};

export default AdvancedDocumentation;
