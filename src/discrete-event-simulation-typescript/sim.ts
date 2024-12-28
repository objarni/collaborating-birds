import type { EventHandler, SimState } from "./sim.types.ts";

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
