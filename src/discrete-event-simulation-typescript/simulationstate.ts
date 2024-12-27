import type { PriorityQueue } from "priority-queue-typescript";
import type {SimEvent} from "./simevent.ts";

export interface SimulationState<EventType extends object, StateType> {
	eventQueue: PriorityQueue<SimEvent<EventType>>;
	systemState: StateType;
	time: number;
}
