/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION: string;
  readonly VITE_STAGE: string;
  readonly VITE_SANITY_PROJECT: string;
  readonly VITE_SANITY_DATASET: string;
  readonly VITE_SANITY_PREVIEW_DATASET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
