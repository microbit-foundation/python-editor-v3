import { VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";

const ApiDocsArea = () => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        setApiDocs(await apiDocs(client));
      }
    };
    load();
  }, [client]);
  return (
    <VStack alignItems="stretch" spacing={5} height="100%" p={5}>
      {apidocs ? (
        Object.values(apidocs).map((module) => (
          <p key={module.fullName}>{module.fullName}</p>
        ))
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </VStack>
  );
};

export default ApiDocsArea;
