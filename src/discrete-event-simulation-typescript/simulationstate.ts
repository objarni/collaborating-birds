import type { PriorityQueue } from "priority-queue-typescript";
import type {SimEvent} from "./simevent.ts";

export interface SimulationState<EventType extends object, SystemStateType> {
	eventQueue: PriorityQueue<SimEvent<EventType>>;
	systemState: SystemStateType;
	time: number;
}
