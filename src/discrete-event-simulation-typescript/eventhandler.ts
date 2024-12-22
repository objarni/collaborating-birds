import type { HandlerResult } from "./handlerresult.ts";
import type { SimEvent } from "./simevent.ts";

export type EventHandler<SystemStateType, EventType> = (
	state: SystemStateType,
	event: SimEvent<EventType>,
) => HandlerResult<SystemStateType, EventType>;
