import type { SimEvent } from "./simevent.ts";

export type HandlerResult<EventType, StateType> = {
	newSystemState: StateType;
	events: SimEvent<EventType>[];
};
