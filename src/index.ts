import {
  isFunction,
  isObject,
  isSerializedError,
  isSerializedFunction,
  isTransferableObject,
} from "./utils/types.ts";

import { CallStatus } from "./model/call-statuses.ts";
import { CallType } from "./model/call-types.ts";
import { MESSAGE } from "./model/contants.ts";
import { Markers } from "./model/markers.ts";
import type { FunctionCall, FunctionCallResponse } from "./types/function.ts";
import type {
  SerializedError,
  SerializedFunction,
} from "./types/serialized.ts";
import { portsFinalizer } from "./model/port-finilizer.ts";
import { generateId } from "./utils/ids.ts";
import { instanceEntries } from "./utils/classes.ts";

function serializeError(error: Error): SerializedError {
  return {
    [Markers.Error]: true,
    message: error.message,
    stack: error.stack,
    name: error.name,
  };
}

function deserializeError(error: SerializedError): Error {
  return Object.assign(new Error(error.message), error);
}

function serializeFunction(
  fn: (...args: unknown[]) => unknown,
): SerializedFunction {
  const { port1, port2 } = new MessageChannel();
  port1.start();

  const handleMessage = async (ev: MessageEvent) => {
    const [msgId, status, serializedProps] = ev.data as FunctionCall;
    if (status === CallType.Close) {
      port1.removeEventListener(MESSAGE, handleMessage);
      port1.close?.();
      return;
    }
    try {
      const props = deserialize(serializedProps) as unknown[];
      const res = await fn(...props);
      const [serializedRes, transferable] = await serialize(res);
      port1.postMessage(
        [msgId, CallStatus.Success, serializedRes],
        transferable,
      );
    } catch (error) {
      port1.postMessage([
        msgId,
        CallStatus.Error,
        serializeError(error as Error),
      ]);
    }
  };

  port1.addEventListener(MESSAGE, handleMessage);

  return {
    [Markers.Function]: true,
    port: port2,
  };
}

function deserializeFunction(serializedFn: SerializedFunction) {
  const { port } = serializedFn;
  port.start();
  const deserializedProxyFunction = (...args: unknown[]): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const msgId = generateId();
      const messageHandler = (ev: MessageEvent) => {
        const [responseId, status, result] = ev.data as FunctionCallResponse;
        if (responseId !== msgId) return;
        if (status === CallStatus.Success) {
          resolve(deserialize(result));
        } else if (status === CallStatus.Error) {
          reject(deserializeError(result as SerializedError));
        }
        port.removeEventListener(MESSAGE, messageHandler);
      };
      port.addEventListener(MESSAGE, messageHandler);
      serialize(args)
        .then(([serializedArgs, transferable]) =>
          port.postMessage(
            [msgId, CallType.Call, serializedArgs],
            transferable,
          ),
        )
        .catch((err) => {
          reject(err);
          port.removeEventListener(MESSAGE, messageHandler);
        });
    });

  portsFinalizer?.register(deserializedProxyFunction, port);
  return deserializedProxyFunction;
}

export async function serialize(
  data: unknown,
): Promise<[unknown, { transfer: Transferable[] }]> {
  const transfer: Transferable[] = [];
  const serializeSlice = async (slice: unknown): Promise<unknown> => {
    if (!slice) {
      return slice;
    }
    if (slice instanceof Error) {
      return serializeError(slice);
    }
    if (slice instanceof Blob) {
      const transferable = await slice.arrayBuffer();
      transfer.push(transferable);
      return slice;
    }
    if (isTransferableObject(slice)) {
      transfer.push(slice);
      return slice;
    }
    if (isFunction(slice)) {
      const serializedFn = serializeFunction(
        slice as (...args: unknown[]) => unknown,
      );
      transfer.push(serializedFn.port);
      return serializedFn;
    }
    if (!isObject(slice)) {
      return slice;
    }
    if (Array.isArray(slice)) {
      const sliceArr = slice as unknown[];
      return Promise.all(sliceArr.map(serializeSlice));
    }
    return Object.fromEntries(
      await Promise.all(
        instanceEntries(slice).map(async ([key, value]) => [
          key,
          await serializeSlice(value),
        ]),
      ),
    );
  };

  return [await serializeSlice(data), { transfer }];
}

export function deserialize<T = unknown>(data: unknown): T {
  if (data === null || !isObject(data)) {
    return data as T;
  }

  if (isSerializedError(data)) {
    throw deserializeError(data);
  }

  if (isSerializedFunction(data)) {
    return deserializeFunction(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map(deserialize) as T;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      return [key, deserialize(value)];
    }),
  ) as T;
}
