# @lynkxy/postmessage-transfer

## A lightweight library for secure and flexible post message communication

`@lynkxy/postmessage-transfer` is a small, efficient library that simplifies sending and receiving objects, messages and even functions between different threads in different environments via postMessage channel.

## Supported Environments

- Browser (window, iframe, worker)
- Node.js ([worker_threads](https://nodejs.org/api/worker_threads.html))
- Deno ([worker](https://docs.deno.com/examples/web_workers/))

## Features

- Type-safe communication between threads.
- Simple API (only 2 functions, serialize and deserialize)
- Lightweight with no dependencies.
- Package works in browser, node.js and deno in the same way.
- Based on `postMessage` channel and transferable objects.

## Installation

```bash
# Using npm (node.js)
npm install @lynkxy/postmessage-transfer

# Using deno
deno add @lynkxy/postmessage-transfer
```

## Usage

### Basic example (Deno)

**Main thread (index.ts)**

```typescript
import { serialize } from "@lynkxy/postmessage-transfer";

export const logger = {
    log: (message) => {
        console.log("log >>>", message);
        return true;
    },
};

new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
}).postMessage(...await serialize(logger));
```

**Worker thread (worker.ts)**

```typescript
import { deserialize } from "@lynkxy/postmessage-transfer";
import type { logger } from "./index.ts";

self.addEventListener("message", async (e) => {
  deserialize<typeof logger>((e as MessageEvent).data);
  self.close();
});
```

```bash
deno run index.ts

log xxx
```

### Basic example (Node.js)

**Main thread (index.mjs)**

```javascript
// Main thread
import { serialize } from '@lynkxy/postmessage-transfer'
import { Worker } from "worker_threads";

const logger = {
    log: (message) => {
        console.log("log >>>", message);
        return true;
    },
};
new Worker(new URL("./worker.mjs", import.meta.url)).postMessage(...await serialize(logger));
```

**Worker thread (worker.mjs)**

```typescript
import { deserialize } from "@lynkxy/postmessage-transfer";
import { parentPort } from "worker_threads";

parentPort.addEventListener("message", async (e) => {
  deserialize(e.data);
  parentPort.close();
});
```

```bash
node index.mjs

log xxx
```

## API Reference

This library provides two main functions:

1. `serialize` - Converts data into a format that can be sent through postMessage, handling functions, objects, and transferable items.
2. `deserialize` - Converts data received via postMessage back into its original format, restoring functions and object structures.

Both functions work across browser and Node.js environments, enabling seamless communication between different execution contexts.

### serialize

Serializes data to be transferred via MessageChannel.

| Parameter | Description |
|-----------|-------------|
| `data` | The data to serialize |
| **Returns** | A tuple containing `[serialized data, transferable objects]` |

The first element is the serialized data. The second element is an object with a transfer array containing all Transferable objects.

Supported transferable data types:
- ArrayBuffer and views (Uint8Array, Float32Array, etc.)
- MessagePort
- ImageBitmap
- OffscreenCanvas
- AudioData
- VideoFrame
- ReadableStream, WritableStream, TransformStream
- Blob (converted to ArrayBuffer before transfer)
- Functions (converted to serialized proxies with MessagePort)

### deserialize

Deserializes data received via MessageChannel.

| Parameter | Description |
|-----------|-------------|
| `data` | The data to deserialize |
| **Returns** | The deserialized data as type T |

Handles deserialization of:
- Serialized functions (converts back to callable functions)
- Serialized errors (converted to Error objects)
- Arrays (recursively deserializes each element)
- Objects (recursively deserializes each property)
- Primitive values (returned as-is)

## License

MIT
