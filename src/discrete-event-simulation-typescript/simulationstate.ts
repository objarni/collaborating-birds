import type { PriorityQueue } from "priority-queue-typescript";

export interface SimulationState<EventType extends object, SystemStateType> {
	eventQueue: PriorityQueue<EventType>;
	systemState: SystemStateType;
	time: number;
}
