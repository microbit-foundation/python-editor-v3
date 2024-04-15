/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search.worker";
import languageSupport from "lunr-languages/lunr.es";

// Note the language code is different to the app
new SearchWorker(self as DedicatedWorkerGlobalScope, "es", languageSupport);
