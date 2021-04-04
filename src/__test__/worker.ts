import { deserialize } from "../index.ts";
import type { LoggerService } from "./logger.service.ts";

self.addEventListener("message", async (e) => {
  const obj = deserialize<LoggerService>((e as MessageEvent).data);

  console.log(obj);
  console.log(await obj.log("xxx"));
  self.close();
});
