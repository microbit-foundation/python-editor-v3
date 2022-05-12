/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useIsUnmounted from "../common/use-is-unmounted";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSettings } from "../settings/settings";
import dragImage from "./drag-image.svg";
import { fetchReferenceToolkit } from "./reference/content";
import { fetchIdeas } from "./ideas/content";
import { Toolkit } from "./reference/model";
import { pullModulesToTop } from "./api/apidocs-util";
import { Idea } from "./ideas/model";

export type ContentState<T> =
  | { status: "ok"; content: T }
  | { status: "error" }
  | { status: "loading" };

const useContent = <T,>(
  fetchContent: (languageId: string) => Promise<T>
): ContentState<T> => {
  const [state, setState] = useState<ContentState<T>>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    const load = async () => {
      try {
        const content = await fetchContent(languageId);
        if (!isUnmounted()) {
          setState({ status: "ok", content });
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
  }, [setState, isUnmounted, logging, languageId, fetchContent]);
  return state;
};

const useApiDocumentation = (): ApiDocsResponse | undefined => {
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

export interface DocumentationContextValue {
  api: ApiDocsResponse | undefined;
  ideas: ContentState<Idea[]>;
  reference: ContentState<Toolkit>;
}

const DocumentationContext = createContext<
  DocumentationContextValue | undefined
>(undefined);

/**
 * Aggregated documentation.
 */
export const useDocumentation = (): DocumentationContextValue => {
  const value = useContext(DocumentationContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const DocumentationProvider = ({ children }: { children: ReactNode }) => {
  const api = useApiDocumentation();
  const ideas = useContent(fetchIdeas);
  const reference = useContent(fetchReferenceToolkit);
  const value: DocumentationContextValue = useMemo(() => {
    return { reference, api, ideas };
  }, [reference, api, ideas]);
  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
};

export default DocumentationProvider;

let dragImageRefCount = 0;

export const useCodeDragImage = (): RefObject<HTMLImageElement | undefined> => {
  const ref = useRef<HTMLImageElement>();
  useEffect(() => {
    const id = "code-drag-image";
    let img = document.getElementById(id) as HTMLImageElement | null;
    if (!img) {
      img = new Image();
      img.id = id;
      img.alt = "";
      img.src = dragImage;
      // Seems to need to be in the DOM for Safari.
      // Our layout means this will be offscreen.
      document.body.appendChild(img);
    }
    ref.current = img;
    dragImageRefCount++;
    return () => {
      if (!img) {
        throw new Error();
      }
      dragImageRefCount--;
      if (dragImageRefCount === 0) {
        img.remove();
      }
    };
  }, []);
  return ref;
};
