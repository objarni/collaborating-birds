import PriorityQueue from "priority-queue-typescript";

type BarberShopEvent =
	| { kind: "CUSTOMER_ARRIVED"; customerName: string }
	| { kind: "CUSTOMER_FINISHED"; customerName: string; chair: number };
type ChairStates = "EMPTY" | "CUTTING_HAIR";
type SeatStates =
	| { state: "EMPTY" }
	| { state: "WAITING_TO_CUT_HAIR"; customerName: string };

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

function getFinishedEvent(
	now: number,
	chair: number,
	customerName: string,
): SimEvent {
	return <SimEvent>{
		kind: {
			kind: "CUSTOMER_FINISHED",
			chair,
			customerName: customerName,
		},
		time: now + 20,
	};
}

export function barberShopEventHandler(
	systemState: SystemState,
	event: SimEvent,
): { newSystemState: SystemState; events: SimEvent[] } {
	switch (event.kind.kind) {
		case "CUSTOMER_ARRIVED": {
			const nextCustomerArriveEvent = E(
				{ kind: "CUSTOMER_ARRIVED", customerName: randomName() },
				event.time + 9,
			);
			const chair = 0;
			if (systemState.chairs[chair] === "EMPTY") {
				console.log(
					event.time,
					`Customer ${event.kind.customerName} is getting hair cut at chair ${chair}.`,
				);
				systemState.chairs[chair] = "CUTTING_HAIR";
				const finishedEvent = getFinishedEvent(
					event.time,
					chair,
					event.kind.customerName,
				);
				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent, finishedEvent],
				};
			}
			if (systemState.seats[0].state === "EMPTY") {
				console.log(
					event.time,
					`Customer ${event.kind.customerName} takes a seat to wait for a hair cut.`,
				);
				systemState.seats[0] = {
					state: "WAITING_TO_CUT_HAIR",
					customerName: event.kind.customerName,
				};
				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent],
				};
			}
			console.log(
				event.time,
				`The barber shop is busy - customer ${event.kind.customerName} left without entering.`,
			);
			systemState.missedClients += 1;
			return {
				newSystemState: systemState,
				events: [nextCustomerArriveEvent],
			};
		}
		case "CUSTOMER_FINISHED": {
			const chair = event.kind.chair;
			const finishedCustomer = event.kind.customerName;
			systemState.money += 200;
			console.log(
				event.time,
				`${finishedCustomer}'s hair cut finished at chair ${chair}, shop now has ${systemState.money} SEK.`,
			);
			systemState.chairs[chair] = "EMPTY";
			if (systemState.seats[0].state === "WAITING_TO_CUT_HAIR") {
				const seatedCustomer = systemState.seats[0].customerName;
				const finishedEvent = getFinishedEvent(
					event.time,
					chair,
					seatedCustomer,
				);
				systemState.seats[0] = { state: "EMPTY" };
				console.log(
					event.time,
					`The waiting customer ${seatedCustomer} sat down to cut the hair at chair ${chair}.`,
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

export function initialBarberShopState(
	chairs: number,
	seats: number,
): SystemState {
	const initialState: SystemState = {
		money: 0,
		missedClients: 0,
		chairs: Array(chairs).fill("EMPTY"),
		seats: Array(seats).fill({ state: "EMPTY" }),
	};
	return initialState;
}

function randomName(): string {
	// Generate a random 'name' on form F.L
	// where F and L are single random letters
	return `${getRandomLetter()}.${getRandomLetter()}`;
}

function getRandomLetter(): string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomIndex = Math.floor(Math.random() * alphabet.length);
	return alphabet[randomIndex];
}
