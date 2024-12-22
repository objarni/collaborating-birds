import type { SimEvent } from "./simevent.ts";

export type HandlerResult<StateType, EventType> = {
	newSystemState: StateType;
	events: SimEvent<EventType>[];
};
