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
import { apiDocs, ApiDocsContent } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSettings } from "../settings/settings";
import { pullModulesToTop } from "./api/apidocs-util";
import dragImage from "./drag-image.svg";
import { fetchIdeas } from "./ideas/content";
import { Idea } from "./ideas/model";
import { ApiReferenceMap, fetchMappingData } from "./mapping/content";
import { fetchReferenceToolkit } from "./reference/content";
import { Toolkit } from "./reference/model";

export type ContentState<T> =
  | { status: "ok"; content: T; languageId: string }
  | { status: "error" }
  | { status: "loading" };

const useContent = <T,>(
  fetchContent: (languageId: string) => Promise<T>
): ContentState<T> => {
  const [state, setState] = useState<ContentState<T>>({
    status: "loading",
  });
  const logging = useLogging();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const content = await fetchContent(languageId);
        if (!ignore) {
          setState({ status: "ok", content, languageId });
        }
      } catch (e) {
        logging.error(e);
        if (!ignore) {
          setState({
            status: "error",
          });
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [setState, logging, languageId, fetchContent]);
  return state;
};

const useApiDocumentation = (): ApiDocsContent | undefined => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsContent | undefined>();
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (client) {
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        if (!ignore) {
          setApiDocs(docs);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [client]);
  return apidocs;
};

export interface DocumentationContextValue {
  api: ApiDocsContent | undefined;
  ideas: ContentState<Idea[]>;
  reference: ContentState<Toolkit>;
  apiReferenceMap: ContentState<ApiReferenceMap>;
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
  const apiReferenceMap = useContent(fetchMappingData);
  const value: DocumentationContextValue = useMemo(() => {
    return { reference, api, ideas, apiReferenceMap };
  }, [reference, api, ideas, apiReferenceMap]);
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
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.zIndex = "-1";
      // Seems to need to be in the DOM for Safari.
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
