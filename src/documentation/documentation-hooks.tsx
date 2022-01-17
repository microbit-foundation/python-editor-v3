import { useEffect, useState } from "react";
import useIsUnmounted from "../common/use-is-unmounted";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSettings } from "../settings/settings";
import { fetchToolkit } from "./explore/api";
import { Toolkit } from "./explore/model";
import { pullModulesToTop } from "./reference/apidocs-util";
import lunr from "lunr";

type State =
  | { status: "ok"; toolkit: Toolkit }
  | { status: "error" }
  | { status: "loading" };

export const useExploreToolkit = (): State => {
  const [state, setState] = useState<State>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    const load = async () => {
      try {
        const toolkit = await fetchToolkit(languageId);
        if (!isUnmounted()) {
          setState({ status: "ok", toolkit });
        }
      } catch (e) {
        logging.error(e);
        if (!isUnmounted()) {
          setState({
            status: "error",
          });
        }
      }
    };
    load();
  }, [setState, isUnmounted, logging, languageId]);
  return state;
};

export const useApiDocs = (): ApiDocsResponse | undefined => {
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
  return apidocs;
};

interface Search {
  search(text: string): string[];
}

export const useSearch = () => {
  const documents = [
    {
      id: "Lunr",
      text: "Like Solr, but much smaller, and not as bright.",
    },
    {
      id: "React",
      text: "A JavaScript library for building user interfaces.",
    },
    {
      id: "Lodash",
      text: "A modern JavaScript utility library delivering modularity, performance & extras and very modern.",
    },
  ];

  const index = lunr(function () {
    this.ref("id");
    this.field("text");
    this.metadataWhitelist = ["position"];
    for (const doc of documents) {
      this.add(doc);
    }
  });
  return {
    search: (text: string) => {
      const results = index.search(text);
      console.log(results);
      return results.map((r) => r.ref);
    },
  };
};
