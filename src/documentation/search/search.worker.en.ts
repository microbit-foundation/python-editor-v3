/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search.worker";

new SearchWorker(self as DedicatedWorkerGlobalScope, undefined, undefined);
