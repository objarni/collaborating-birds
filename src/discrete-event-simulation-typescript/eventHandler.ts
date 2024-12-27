import type { HandlerResult } from "./handlerResult.ts";
import type { SimEvent } from "./simEvent.ts";

export type EventHandler<EventType, StateType> = (
	state: StateType,
	event: SimEvent<EventType>,
) => HandlerResult<EventType, StateType>;
