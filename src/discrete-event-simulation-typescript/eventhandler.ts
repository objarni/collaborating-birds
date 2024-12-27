import type { HandlerResult } from "./handlerresult.ts";
import type { SimEvent } from "./simevent.ts";

export type EventHandler<EventType, SystemStateType> = (
	state: SystemStateType,
	event: SimEvent<EventType>,
) => HandlerResult<EventType, SystemStateType>;
