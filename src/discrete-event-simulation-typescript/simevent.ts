import type {PriorityQueue} from "priority-queue-typescript";

export interface SimEvent<T> {
	time: number;
	kind: T;
}

export interface SimState<EventType extends object, StateType> {
	events: PriorityQueue<SimEvent<EventType>>;
	state: StateType;
	time: number;
}