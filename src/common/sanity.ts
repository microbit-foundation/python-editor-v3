/**
 * Common sanity types.
 */

import { flags } from "../flags";

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
  try {
    const preferred = adaptContent(
      await fetchContentInternal(query(sanityLanguageId(languageId)))
    );
    if (preferred) {
      return preferred;
    }
  } catch (err) {
    // Fall through to fallback without crashing if user is offline.
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

export const sanityLanguageId = (locale: string): string => {
  if (!locale) {
    return "";
  }
  if (locale && !locale.match(/^[A-Za-z-]+$/g)) {
    throw new Error(`Invalid language id: ${locale}`);
  }
  const parts = locale.split("-");
  if (parts.length !== 2) {
    return locale;
  }
  return `${parts[0]}-${parts[1].toUpperCase()}`;
};

export const project = import.meta.env.VITE_SANITY_PROJECT;
export const dataset = flags.cmsPreview
  ? import.meta.env.VITE_SANITY_PREVIEW_DATASET
  : import.meta.env.VITE_SANITY_DATASET;

const queryUrl = (query: string): string => {
  return `https://${project}.apicdn.sanity.io/v1/data/query/${dataset}?query=${encodeURIComponent(
    query
  )}`;
};
