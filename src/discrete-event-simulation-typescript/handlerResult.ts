import type { SimEvent } from "./simEvent.ts";

export type HandlerResult<EventType, StateType> = {
	newSystemState: StateType;
	events: SimEvent<EventType>[];
};
