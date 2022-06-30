/**
 * Common sanity types.
 */

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  // Partial/lax modelling. We pass this straight to Sanity's rendering API.
  children: any;
  markDefs: any;
  style: string;
}

export type PortableText = Array<
  PortableTextBlock | { _type: string; children?: any; [other: string]: any }
>;

/**
 * Common image type.
 */
export interface SimpleImage {
  _type: "simpleImage";
  alt?: string;
  // The Sanity image asset.
  asset: any;
}

/**
 * Sanity's slug type.
 */
export interface Slug {
  _type: "slug";
  current: string;
}

/**
 * Query CMS content preferring the given language but
 * falling back to "en" if it is not present.
 *
 * @param languageId The preferred language.
 * @param adaptContent Validates and converts the result.
 * @returns The content.
 */
export const fetchContent = async <T>(
  languageId: string,
  query: (languageId: string) => string,
  adaptContent: (result: any) => T | undefined
): Promise<T> => {
  const preferred = adaptContent(await fetchContentInternal(query(languageId)));
  if (preferred) {
    return preferred;
  }
  const fallback = adaptContent(await fetchContentInternal(query("en")));
  if (!fallback) {
    throw new Error("English content must exist");
  }
  return fallback;
};

const fetchContentInternal = async (query: string): Promise<any> => {
  const response = await fetch(queryUrl(query));
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    return result;
  }
  throw new Error("Error fetching content: " + response.status);
};

const queryUrl = (query: string): string => {
  return (
    "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=" +
    encodeURIComponent(query)
  );
};
