export interface FinalizationRegistryType<T> {
  // deno-lint-ignore no-misused-new
  new (cb: (heldValue: T) => void): FinalizationRegistryType<T>;
  register(
    weakItem: object,
    heldValue: T,
    unregisterToken?: object | undefined,
  ): void;
  unregister(unregisterToken: object): void;
}
