import { PriorityQueue } from "priority-queue-typescript";
import type {
	BarberShopEvent,
	ChairStates,
	Customer,
	Place,
	SimEvent,
	SystemState,
} from "./barbershop.types.ts";

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
			finishedCustomer: customerName,
		},
		time: now + 20,
	};
}

function findLongestWaitingCustomer(systemState: SystemState) {
	let longestWaitingCustomer = -1;
	let earliestSitDownTime = Number.POSITIVE_INFINITY;
	for (let i = systemState.seats.length - 1; i >= 0; i--) {
		const seat = systemState.seats[i];
		if (seat.state === "WAITING_TO_CUT_HAIR") {
			if (seat.sitDownTime < earliestSitDownTime) {
				longestWaitingCustomer = i;
				earliestSitDownTime = seat.sitDownTime;
			}
		}
	}
	return longestWaitingCustomer;
}

export function barberShopEventHandler(
	systemState: SystemState,
	event: SimEvent,
): { newSystemState: SystemState; events: SimEvent[] } {
	switch (event.kind.kind) {
		case "CUSTOMER_ARRIVED": {
			const arrivingCustomer = event.kind.arrivingCustomer;
			console.log(
				`Customer ${arrivingCustomer} arrived, staring through window.`,
			);
			const customerDecisionEvent = E(
				{
					kind: "CUSTOMER_DECIDED",
					decidedCustomer: arrivingCustomer,
				},
				event.time + 1,
			);
			systemState.customers.push({
				name: arrivingCustomer,
				place: {
					kind: "AtWindow",
					which: 0,
				},
			});
			return {
				newSystemState: systemState,
				events: [customerDecisionEvent],
			};
		}
		case "CUSTOMER_DECIDED": {
			// check is a chair (primarily) or sofa seat (secondarily) is empty
			// if not, customer leaves

			const nextCustomerArriveEvent = E(
				{ kind: "CUSTOMER_ARRIVED", arrivingCustomer: randomName() },
				event.time + 8,
			);
			const chair = systemState.chairs.findIndex(
				(chair) => chair.state === "EMPTY",
			);
			const decidedCustomer = event.kind.decidedCustomer;
			if (chair >= 0) {
				console.log(
					event.time,
					`Customer ${decidedCustomer} is getting a hair cut at chair ${chair}.`,
				);
				systemState.chairs[chair] = {
					state: "CUTTING_HAIR",
					customerName: decidedCustomer,
				};
				const newPlace: Place = {
					kind: "Chair",
					which: chair,
				};
				const newCustomer: Customer = {
					name: decidedCustomer,
					place: newPlace,
				};
				systemState.customers = systemState.customers.map((customer) =>
					customer.name === decidedCustomer ? newCustomer : customer,
				);

				const finishedEvent = getFinishedEvent(
					event.time,
					chair,
					decidedCustomer,
				);
				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent, finishedEvent],
				};
			}

			const seat = systemState.seats.findIndex(
				(seat) => seat.state === "EMPTY",
			);
			if (seat >= 0) {
				console.log(
					event.time,
					`Customer ${decidedCustomer} takes seat ${seat} to wait for a hair cut.`,
				);
				systemState.seats[seat] = {
					state: "WAITING_TO_CUT_HAIR",
					customerName: decidedCustomer,
					sitDownTime: event.time,
				};

				const newPlace: Place = {
					kind: "Seat",
					which: seat,
				};
				const newCustomer: Customer = {
					name: decidedCustomer,
					place: newPlace,
				};
				systemState.customers = systemState.customers.map((customer) =>
					customer.name === decidedCustomer ? newCustomer : customer,
				);

				return {
					newSystemState: systemState,
					events: [nextCustomerArriveEvent],
				};
			}

			console.log(
				event.time,
				`${decidedCustomer} arrived, and left - barber shop is busy.`,
			);
			systemState.customers = systemState.customers.filter(
				(customer) => customer.name !== decidedCustomer,
			);

			systemState.missedClients += 1;

			return {
				newSystemState: systemState,
				events: [nextCustomerArriveEvent],
			};
		}

		case "CUSTOMER_FINISHED": {
			const chair = event.kind.chair;
			const finishedCustomer = event.kind.finishedCustomer;
			systemState.customers = systemState.customers.filter(
				(customer) => customer.name !== finishedCustomer,
			);
			systemState.money += 200;
			console.log(
				event.time,
				`${finishedCustomer}'s hair cut finished at chair ${chair}, shop now has ${systemState.money} SEK.`,
			);
			systemState.chairs[chair] = { state: "EMPTY" };
			const seatWithWaitingCustomer = findLongestWaitingCustomer(systemState);

			if (seatWithWaitingCustomer >= 0) {
				if (
					systemState.seats[seatWithWaitingCustomer].state ===
					"WAITING_TO_CUT_HAIR"
				) {
					const seatedCustomer =
						systemState.seats[seatWithWaitingCustomer].customerName;
					for (let i = 0; i < systemState.customers.length; i++) {
						if (systemState.customers[i].name === seatedCustomer) {
							systemState.customers[i].place = {
								kind: "Chair",
								which: chair,
							};
						}
					}
					const finishedEvent = getFinishedEvent(
						event.time,
						chair,
						seatedCustomer,
					);
					systemState.seats[seatWithWaitingCustomer] = { state: "EMPTY" };
					console.log(
						event.time,
						`The waiting customer ${seatedCustomer} at seat ${seatWithWaitingCustomer} sat down at chair ${chair}.`,
					);
					systemState.chairs[chair] = {
						state: "CUTTING_HAIR",
						customerName: seatedCustomer,
					};
					return {
						newSystemState: systemState,
						events: [finishedEvent],
					};
				}
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
	// const chairStates: ChairStates[] = Array(chairs).fill("EMPTY");
	const chairStates: ChairStates[] = Array(chairs)
		.fill(null)
		.map(() => ({ state: "EMPTY" })); // Create unique objects

	return {
		money: 0,
		missedClients: 0,
		chairs: chairStates,
		seats: Array(seats).fill({ state: "EMPTY" }),
		customers: [],
	};
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
