import PriorityQueue from "priority-queue-typescript";

type EventKind = "CUSTOMER_ARRIVED" | "CUSTOMER_FINISHED";
type ChairStates = "EMPTY" | "CUTTING_HAIR";
type SeatStates = "EMPTY" | "WAITING_TO_CUT_HAIR";

export interface SystemState {
	missedClients: number;
	money: number;
	seats: SeatStates[];
	chairs: ChairStates[];
}

export interface Event {
	time: number;
	kind: EventKind;
}

function E(kind: EventKind, time: number): Event {
	return {
		kind,
		time,
	};
}

function getFinishedEvent(now: number) {
	return E("CUSTOMER_FINISHED", now + 20);
}

export function barberShopEventHandler(
	systemState: SystemState,
	event: Event,
): { newSystemState: SystemState; events: Event[] } {
	switch (event.kind) {
		case "CUSTOMER_FINISHED": {
			systemState.money += 200;
			console.log(
				event.time,
				`A hair cut finished, shop now has ${systemState.money} SEK.`,
			);
			systemState.chairs[0] = "EMPTY";
			if (systemState.seats[0] === "WAITING_TO_CUT_HAIR") {
				const finishedEvent = getFinishedEvent(event.time);
				systemState.seats[0] = "EMPTY";
				console.log(event.time, "A waiting customer sat down to cut the hair.");
				systemState.chairs[0] = "CUTTING_HAIR";
				return {
					newSystemState: systemState,
					events: [finishedEvent],
				};
			}
			return {
				newSystemState: systemState,
				events: [],
			};
		}
		case "CUSTOMER_ARRIVED": {
			const nextCustomerArriveEvent = E("CUSTOMER_ARRIVED", event.time + 10);
			if (systemState.chairs[0] === "EMPTY") {
				console.log(event.time, "A customer is getting hair cut.");
				systemState.chairs[0] = "CUTTING_HAIR";
				const finishedEvent = getFinishedEvent(event.time);
				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent, finishedEvent],
				};
			}
			if (systemState.seats[0] === "EMPTY") {
				console.log(
					event.time,
					"A customer takes a seat to wait for hair cut.",
				);
				systemState.seats[0] = "WAITING_TO_CUT_HAIR";
				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent],
				};
			}
			console.log(
				event.time,
				"The barber shop is busy - a customer left without entering.",
			);
			systemState.missedClients += 1;
			return {
				newSystemState: systemState,
				events: [nextCustomerArriveEvent],
			};
		}
	}
}

export interface SimulationState {
	eventQueue: PriorityQueue<Event>;
	systemState: SystemState;
	time: number;
}

export function simulate(
	initialEvents: Event[],
	initialSystemState: SystemState,
	simulationTimeMinutes: number,
	handleEvent: (
		state: SystemState,
		event: Event,
	) => {
		newSystemState: SystemState;
		events: Event[];
	},
): SystemState {
	const eventQueue = new PriorityQueue<Event>(
		10, // initial capability of queue
		(a: Event, b: Event) => a.time - b.time,
	);
	for (const event of initialEvents) {
		eventQueue.add(event);
	}
	let simulationState = {
		time: 0,
		systemState: initialSystemState,
		eventQueue: eventQueue,
	};
	simulationState = simStep(
		simulationState,
		simulationTimeMinutes,
		handleEvent,
	);
	return simulationState.systemState;
}

export function simStep(
	simulationState: SimulationState,
	deltaTimeMinutes: number,
	handleEvent: (
		state: SystemState,
		event: Event,
	) => {
		newSystemState: SystemState;
		events: Event[];
	},
): SimulationState {
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
		const result = handleEvent(simulationState.systemState, nextEvent);
		simulationState.systemState = result.newSystemState;
		for (const event of result.events) {
			simulationState.eventQueue.add(event);
		}
	}
}

export function initialBarberShopState(chairs: number, seats: number) {
	const initialState: SystemState = {
		money: 0,
		missedClients: 0,
		chairs: Array(chairs).fill("EMPTY"),
		seats: Array(seats).fill("EMPTY"),
	};
	return initialState;
}
