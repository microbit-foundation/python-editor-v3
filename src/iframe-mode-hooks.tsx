/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";

const IframeModeContext = createContext(false);

/**
 * Whether the app is embedded in controller mode (classroom). The embedding
 * page then owns the project and there are no pages besides the editor.
 */
export const IframeModeProvider = IframeModeContext.Provider;

export const useIframeMode = (): boolean => useContext(IframeModeContext);
