import { serialize } from "../index.ts";
import { LoggerService } from "./logger.service.ts";

const logger = new LoggerService("MAIN: ");

new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
}).postMessage(...await serialize(logger));
