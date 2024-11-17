import PriorityQueue from "priority-queue-typescript";

type BarberShopEvent =
	| { kind: "CUSTOMER_ARRIVED" }
	| { kind: "CUSTOMER_FINISHED"; chair: number };
type ChairStates = "EMPTY" | "CUTTING_HAIR";
type SeatStates = "EMPTY" | "WAITING_TO_CUT_HAIR";

export interface SystemState {
	missedClients: number;
	money: number;
	seats: SeatStates[];
	chairs: ChairStates[];
}

export interface SimEvent {
	time: number;
	kind: BarberShopEvent;
}

function E(kind: BarberShopEvent, time: number): SimEvent {
	return {
		kind,
		time,
	};
}

function getFinishedEvent(now: number, chair: number): SimEvent {
	return <SimEvent>{
		kind: {
			kind: "CUSTOMER_FINISHED",
			chair,
		},
		time: now + 20,
	};
}

export function barberShopEventHandler(
	systemState: SystemState,
	event: SimEvent,
): { newSystemState: SystemState; events: SimEvent[] } {
	switch (event.kind.kind) {
		case "CUSTOMER_FINISHED": {
			const chair = event.kind.chair;
			systemState.money += 200;
			console.log(
				event.time,
				`A hair cut finished at chair ${chair}, shop now has ${systemState.money} SEK.`,
			);
			systemState.chairs[chair] = "EMPTY";
			if (systemState.seats[0] === "WAITING_TO_CUT_HAIR") {
				const finishedEvent = getFinishedEvent(event.time, chair);
				systemState.seats[0] = "EMPTY";
				console.log(
					event.time,
					`A waiting customer sat down to cut the hair at chair ${chair}.`,
				);
				systemState.chairs[chair] = "CUTTING_HAIR";
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
			const nextCustomerArriveEvent = E(
				{ kind: "CUSTOMER_ARRIVED" },
				event.time + 10,
			);
			const chair = 0;
			if (systemState.chairs[chair] === "EMPTY") {
				console.log(
					event.time,
					`A customer is getting hair cut at chair ${chair}.`,
				);
				systemState.chairs[chair] = "CUTTING_HAIR";
				const finishedEvent = getFinishedEvent(event.time, chair);
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
	eventQueue: PriorityQueue<SimEvent>;
	systemState: SystemState;
	time: number;
}

export function simulate(
	initialEvents: SimEvent[],
	initialSystemState: SystemState,
	simulationTimeMinutes: number,
	handleEvent: (
		state: SystemState,
		event: SimEvent,
	) => {
		newSystemState: SystemState;
		events: SimEvent[];
	},
): SystemState {
	const eventQueue = new PriorityQueue<SimEvent>(
		10, // initial capability of queue
		(a: SimEvent, b: SimEvent) => a.time - b.time,
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
		event: SimEvent,
	) => {
		newSystemState: SystemState;
		events: SimEvent[];
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
