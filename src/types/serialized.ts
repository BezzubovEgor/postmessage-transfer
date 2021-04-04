import type { Markers } from "../model/markers.ts";

export type SerializedFunction = {
  [Markers.Function]: true;
  port: MessagePort;
};

export type SerializedError = {
  [Markers.Error]: true;
  message: string;
  name: string;
  stack?: string;
};
