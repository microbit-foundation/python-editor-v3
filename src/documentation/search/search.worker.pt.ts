/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search.worker";
import languageSupport from "lunr-languages/lunr.pt";

new SearchWorker(self as DedicatedWorkerGlobalScope, "pt", languageSupport);
