import type { CallStatus } from "../model/call-statuses.ts";
import type { CallType } from "../model/call-types.ts";

export type FunctionCallType = (typeof CallType)[keyof typeof CallType];
export type FunctionCall = [string, FunctionCallType, unknown[]];

export type FunctionCallStatus = (typeof CallStatus)[keyof typeof CallStatus];
export type FunctionCallResponse = [string, FunctionCallStatus, unknown];
