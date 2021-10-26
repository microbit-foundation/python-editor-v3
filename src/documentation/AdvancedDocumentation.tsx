import { Box } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { apiDocs } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { pullModulesToTop } from "./apidocs-util";
import { Toolkit } from "./ToolkitDocumentation/model";
import ToolkitDocumentation from "./ToolkitDocumentation";

const AdvancedDocumentation = () => {
  const client = useLanguageServerClient();
  const intl = useIntl();
  const [apidocs, setApiDocs] = useState<Toolkit | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        const contents = Object.values(docs).map((module) => {
          return {
            name: module.fullName,
            description: module.docString || "",
            contents: [],
          };
        });
        setApiDocs({
          name: "Advanced",
          description: "Reference documentation for MicroPython",
          contents,
        });
      }
    };
    load();
  }, [client]);
  return (
    <Box>
      {apidocs ? (
        <ToolkitDocumentation toolkit={apidocs} />
      ) : (
        <Spinner
          display="block"
          ml="auto"
          mr="auto"
          mt={2}
          label={intl.formatMessage({ id: "loading" })}
        />
      )}
    </Box>
  );
};

export default AdvancedDocumentation;
