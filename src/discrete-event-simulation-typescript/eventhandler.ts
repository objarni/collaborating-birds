import type { HandlerResult, SimEvent } from "./simevent.ts";

export type EventHandler<EventType, StateType> = (
	state: StateType,
	event: SimEvent<EventType>,
) => HandlerResult<EventType, StateType>;
