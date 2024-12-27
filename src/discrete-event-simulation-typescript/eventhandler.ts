import type { HandlerResult } from "./handlerresult.ts";
import type { SimEvent } from "./simevent.ts";

export type EventHandler<EventType, StateType> = (
	state: StateType,
	event: SimEvent<EventType>,
) => HandlerResult<EventType, StateType>;
