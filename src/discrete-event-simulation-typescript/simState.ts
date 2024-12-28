import type { PriorityQueue } from "priority-queue-typescript";
import type {SimEvent} from "./simevent.ts";

export interface SimState<EventType extends object, StateType> {
	eventQueue: PriorityQueue<SimEvent<EventType>>;
	state: StateType;
	time: number;
}
