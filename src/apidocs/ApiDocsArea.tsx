import { Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { apiDocs, ApiDocsResponse, DocEntry } from "../language-server/apidocs";
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
    <VStack alignItems="stretch" height="100%" p={5}>
      {apidocs ? (
        Object.values(apidocs).map((module) => (
          <ModuleDocs key={module.fullName} docs={module} />
        ))
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </VStack>
  );
};

const ModuleDocs = ({
  docs: { kind, fullName, children = {}, type, docString },
}: {
  docs: DocEntry;
}) => {
  // Hack until API returns module kind for top-level docs.
  kind = !kind ? "module" : kind;
  if (fullName.endsWith("__")) {
    // Skip dunder methods for now.
    return null;
  }

  let suffix = kind === "function" ? type || "()" : "";
  suffix = suffix.replace(/ -> None$/, "");
  return (
    <VStack
      alignItems="stretch"
      wordBreak="break-word"
      pb={kind === "module" ? 8 : undefined}
    >
      <div>
        <Text fontSize={kind === "module" ? "xl" : "medium"}>
          <Text as="span" fontWeight="semibold">
            {fullName}
          </Text>
          {suffix}
        </Text>
      </div>
      {Object.values(children)
        .filter((c) => c.kind !== "module")
        .map((c) => (
          <ModuleDocs key={c.fullName} docs={c} />
        ))}
      {Object.values(children)
        .filter((c) => c.kind === "module")
        .map((c) => (
          <ModuleDocs key={c.fullName} docs={c} />
        ))}
    </VStack>
  );
};

export default ApiDocsArea;
