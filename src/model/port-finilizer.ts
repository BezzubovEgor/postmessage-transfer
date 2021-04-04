import type { FinalizationRegistryType } from "../types/finalization-registry.ts";
import { CallType } from "./call-types.ts";

// deno-lint-ignore no-var
declare var FinalizationRegistry: FinalizationRegistryType<MessagePort>;

export const portsFinalizer =
  "FinalizationRegistry" in globalThis
    ? new FinalizationRegistry((port: MessagePort) => {
        port.postMessage(["", CallType.Close]);
        port.close?.();
      })
    : undefined;
