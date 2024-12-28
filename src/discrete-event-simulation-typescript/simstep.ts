import type { SimState } from "./simState.ts";
import type { EventHandler } from "./eventhandler.ts";

export function simStep<EventType extends object, StateType>(
	simulationState: SimState<EventType, StateType>,
	deltaTimeMinutes: number,
	handleEvent: EventHandler<EventType, StateType>,
): SimState<EventType, StateType> {
	const newTime = simulationState.time + deltaTimeMinutes;
	while (true) {
		const nextEvent = simulationState.eventQueue.poll();
		if (nextEvent === null) {
			return {
				...simulationState,
				time: newTime,
			};
		}
		if (nextEvent.time > newTime) {
			simulationState.eventQueue.add(nextEvent);
			return {
				...simulationState,
				time: newTime,
			};
		}
		const result = handleEvent(simulationState.state, nextEvent);
		simulationState.state = result.newSystemState;
		for (const event of result.events) {
			simulationState.eventQueue.add(event);
		}
	}
}
