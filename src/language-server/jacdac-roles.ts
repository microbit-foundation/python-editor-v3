/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProtocolRequestType } from "vscode-languageserver-protocol";
import { LanguageServerClient } from "./client";
import { isErrorDueToDispose } from "./error-util";

// This duplicates the types we added to Pyright (the pyright/jacdacRoles request).
// It lists the Jacdac roles used in a file (proper AST parsing, type-aware). The
// reserved-character warning is a separate Pyright checker diagnostic that flows
// through the normal diagnostics pipeline.

export interface JacdacRolesParams {
  path: string;
}

export interface JacdacRoleResult {
  name: string;
  constructorName: string;
}

export interface JacdacRolesResponse {
  roles: JacdacRoleResult[];
}

export const jacdacRolesRequestType = new ProtocolRequestType<
  JacdacRolesParams,
  JacdacRolesResponse,
  never,
  void,
  void
>("pyright/jacdacRoles");

/**
 * List the Jacdac roles used in a file via our custom Pyright request.
 */
export const jacdacRoles = async (
  client: LanguageServerClient,
  path: string
): Promise<JacdacRolesResponse> => {
  try {
    return await client.connection.sendRequest(jacdacRolesRequestType, { path });
  } catch (e) {
    if (isErrorDueToDispose(e)) {
      return { roles: [] };
    }
    throw e;
  }
};
