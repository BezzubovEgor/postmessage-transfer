import { isFunction } from "./types.ts";

export function getAllPropertyNames(obj: object): string[] {
  const props = new Set<string>();
  let currentObj = obj;

  do {
    Object.getOwnPropertyNames(currentObj).forEach((prop) => props.add(prop));

    currentObj = Object.getPrototypeOf(currentObj);
  } while (currentObj && currentObj !== Object.prototype);

  return Array.from(props);
}

export function instanceEntries<T extends object>(
  instance: T,
): [string, unknown][] {
  const entries: [string, unknown][] = [];
  const propertyNames = getAllPropertyNames(instance);

  for (const prop of propertyNames) {
    if (prop === "constructor" || prop.startsWith("_")) {
      continue;
    }

    try {
      const value = instance[prop as keyof T];
      const boundValue = isFunction(value) ? value.bind(instance) : value;

      entries.push([prop, boundValue]);
    } catch {
      continue;
    }
  }

  return entries;
}
