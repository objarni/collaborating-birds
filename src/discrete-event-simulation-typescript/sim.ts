import { PriorityQueue } from "priority-queue-typescript";
import type { EventHandler, SimEvent, SimState } from "./sim.types.ts";

export function simStep<EventType extends object, StateType>(
	simulationState: SimState<EventType, StateType>,
	deltaTimeMinutes: number,
	handleEvent: EventHandler<EventType, StateType>,
): SimState<EventType, StateType> {
	const newTime = simulationState.time + deltaTimeMinutes;
	while (true) {
		const nextEvent = simulationState.events.poll();
		if (nextEvent === null) {
			return {
				...simulationState,
				time: newTime,
			};
		}
		if (nextEvent.time > newTime) {
			simulationState.events.add(nextEvent);
			return {
				...simulationState,
				time: newTime,
			};
		}
		const result = handleEvent(simulationState.state, nextEvent);
		simulationState.state = result.newSystemState;
		for (const event of result.events) {
			simulationState.events.add(event);
		}
	}
}

export function simulate<EventType extends object, StateType>(
	initialEvents: SimEvent<EventType>[],
	initialSystemState: StateType,
	simulationTimeMinutes: number,
	handleEvent: EventHandler<EventType, StateType>,
): StateType {
	const events = new PriorityQueue<SimEvent<EventType>>(
		10, // initial capability of queue
		(a: SimEvent<EventType>, b: SimEvent<EventType>) => a.time - b.time,
	);
	for (const event of initialEvents) {
		events.add(event);
	}
	const finalSimState = simStep<EventType, StateType>(
		{
			time: 0,
			state: initialSystemState,
			events,
		},
		simulationTimeMinutes,
		handleEvent,
	);
	return finalSimState.state;
}
