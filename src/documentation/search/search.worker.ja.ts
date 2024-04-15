/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search.worker";
import languageSupport from "lunr-languages/lunr.ja";

new SearchWorker(self as DedicatedWorkerGlobalScope, "ja", languageSupport);
