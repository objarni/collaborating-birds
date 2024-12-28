import type { PriorityQueue } from "priority-queue-typescript";

export interface SimEvent<T> {
	time: number;
	kind: T;
}

export interface SimState<EventType extends object, StateType> {
	events: PriorityQueue<SimEvent<EventType>>;
	state: StateType;
	time: number;
}

export type HandlerResult<EventType, StateType> = {
	newSystemState: StateType;
	events: SimEvent<EventType>[];
};

export type EventHandler<EventType, StateType> = (
	state: StateType,
	event: SimEvent<EventType>,
) => HandlerResult<EventType, StateType>;
