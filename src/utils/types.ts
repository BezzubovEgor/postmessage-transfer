import { Markers } from "../model/markers.ts";
import type {
  SerializedFunction,
  SerializedError,
} from "../types/serialized.ts";

export function isObject(val: unknown): val is object {
  return typeof val === "object" && val !== null;
}

export function isObjectLike<T extends object>(value: unknown): value is T {
  const type = typeof value;
  return value != null && (type === "object" || type === "function");
}

export function isString(value: unknown): value is string {
  return typeof value === "string" || value instanceof String;
}

export function isFunction(
  value: unknown,
): value is (...args: unknown[]) => unknown {
  return typeof value === "function";
}

export function isPromise<T = void>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function isSerializedFunction(val: unknown): val is SerializedFunction {
  const def = val as SerializedFunction;
  return !!def[Markers.Function] && def?.port instanceof MessagePort;
}

export function isSerializedError(val: unknown): val is SerializedError {
  return !!(val as SerializedError)[Markers.Error];
}

export function isTransferableObject(obj: unknown): obj is Transferable {
  return (
    obj instanceof ArrayBuffer ||
    obj instanceof MessagePort ||
    ("ImageBitmap" in globalThis && obj instanceof ImageBitmap) ||
    ("ReadableStream" in globalThis && obj instanceof ReadableStream) ||
    ("WritableStream" in globalThis && obj instanceof WritableStream) ||
    ("TransformStream" in globalThis && obj instanceof TransformStream) ||
    ("OffscreenCanvas" in globalThis &&
      // @ts-ignore: OffscreenCanvas may not be available in all environments
      obj instanceof OffscreenCanvas) ||
    ("AudioData" in globalThis &&
      // @ts-ignore: AudioData may not be available in all environments
      obj instanceof AudioData) ||
    ("VideoFrame" in globalThis &&
      // @ts-ignore: VideoFrame may not be available in all environments
      obj instanceof VideoFrame) ||
    ArrayBuffer.isView(obj)
  );
}
