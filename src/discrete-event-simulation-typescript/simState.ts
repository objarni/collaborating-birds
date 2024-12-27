import type { PriorityQueue } from "priority-queue-typescript";
import type {SimEvent} from "./simEvent.ts";

export interface SimState<EventType extends object, StateType> {
	eventQueue: PriorityQueue<SimEvent<EventType>>;
	systemState: StateType;
	time: number;
}
