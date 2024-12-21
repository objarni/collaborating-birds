import { PriorityQueue } from "priority-queue-typescript";
import type {
	BarberShopEvent,
	BarberShopSimEvent,
	BarberShopSimState,
	BarberShopState,
	ChairStates,
	Customer,
	EventHandler,
	HandlerResult,
} from "./barbershop.types.ts";

function E(kind: BarberShopEvent, time: number): BarberShopSimEvent {
	return {
		kind,
		time,
	};
}

function getFinishedEvent(
	now: number,
	chair: number,
	customerName: string,
): BarberShopSimEvent {
	return <BarberShopSimEvent>{
		kind: {
			kind: "CUSTOMER_FINISHED",
			chair,
			finishedCustomer: customerName,
		},
		time: now + randomRange(15, 60),
	};
}

function findLongestWaitingCustomer(systemState: BarberShopState) {
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

function randomRange(a: number, b: number) {
	return Math.random() * (b - a) + a;
}

function handleCustomerArrived(
	barberShopEvent: {
		kind: "CUSTOMER_ARRIVED";
		arrivingCustomer: string;
	},
	eventTime: number,
	systemState: BarberShopState,
): HandlerResult {
	const arrivingCustomer = barberShopEvent.arrivingCustomer;
	console.log(`Customer ${arrivingCustomer} arrived, staring through window.`);
	const customerDecisionEvent = E(
		{
			kind: "CUSTOMER_DECIDED",
			decidedCustomer: arrivingCustomer,
		},
		eventTime + 1,
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

function handleCustomerDecided(
	barberShopEvent: { kind: "CUSTOMER_DECIDED"; decidedCustomer: string },
	eventTime: number,
	systemState: BarberShopState,
): HandlerResult {
	const nextCustomerArriveEvent = E(
		{
			kind: "CUSTOMER_ARRIVED",
			arrivingCustomer: randomName(systemState.customers),
		},
		eventTime + randomRange(2, 20),
	);
	const chair = systemState.chairs.findIndex(
		(chair) => chair.state === "EMPTY",
	);
	const decidedCustomer = barberShopEvent.decidedCustomer;
	if (chair >= 0) {
		console.log(
			eventTime,
			`Customer ${decidedCustomer} is getting a hair cut at chair ${chair}.`,
		);
		systemState.chairs[chair] = {
			state: "CUTTING_HAIR",
			customerName: decidedCustomer,
		};
		const newCustomer: Customer = {
			name: decidedCustomer,
			place: {
				kind: "Chair",
				which: chair,
			},
		};
		systemState.customers = systemState.customers.map((customer) =>
			customer.name === decidedCustomer ? newCustomer : customer,
		);

		const finishedEvent = getFinishedEvent(eventTime, chair, decidedCustomer);
		return {
			newSystemState: systemState,
			events: [nextCustomerArriveEvent, finishedEvent],
		};
	}

	const seat = systemState.seats.findIndex((seat) => seat.state === "EMPTY");
	if (seat >= 0) {
		console.log(
			eventTime,
			`Customer ${decidedCustomer} takes seat ${seat} to wait for a hair cut.`,
		);
		systemState.seats[seat] = {
			state: "WAITING_TO_CUT_HAIR",
			customerName: decidedCustomer,
			sitDownTime: eventTime,
		};

		const newCustomer: Customer = {
			name: decidedCustomer,
			place: {
				kind: "Seat",
				which: seat,
			},
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
		eventTime,
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

function handleCustomerFinished(
	barberShopEvent: {
		kind: "CUSTOMER_FINISHED";
		finishedCustomer: string;
		chair: number;
	},
	eventTime: number,
	systemState: BarberShopState,
): HandlerResult {
	const chair = barberShopEvent.chair;
	const finishedCustomer = barberShopEvent.finishedCustomer;
	systemState.customers = systemState.customers.filter(
		(customer) => customer.name !== finishedCustomer,
	);
	systemState.money += 200;
	console.log(
		eventTime,
		`${finishedCustomer}'s hair cut finished at chair ${chair}, shop now has ${systemState.money} SEK.`,
	);
	systemState.chairs[chair] = { state: "EMPTY" };
	const seatWithWaitingCustomer = findLongestWaitingCustomer(systemState);

	if (seatWithWaitingCustomer >= 0) {
		if (
			systemState.seats[seatWithWaitingCustomer].state === "WAITING_TO_CUT_HAIR"
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
			const finishedEvent = getFinishedEvent(eventTime, chair, seatedCustomer);
			systemState.seats[seatWithWaitingCustomer] = { state: "EMPTY" };
			console.log(
				eventTime,
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

export function barberShopEventHandler(
	systemState: BarberShopState,
	event: BarberShopSimEvent,
): HandlerResult {
	const barberShopEvent = event.kind;
	const eventTime = event.time;
	return handleBarberShopEvent(barberShopEvent, eventTime, systemState);
}

function handleBarberShopEvent(
	barberShopEvent: BarberShopEvent,
	eventTime: number,
	systemState: BarberShopState,
): HandlerResult {
	switch (barberShopEvent.kind) {
		case "CUSTOMER_ARRIVED": {
			return handleCustomerArrived(barberShopEvent, eventTime, systemState);
		}
		case "CUSTOMER_DECIDED": {
			return handleCustomerDecided(barberShopEvent, eventTime, systemState);
		}
		case "CUSTOMER_FINISHED": {
			return handleCustomerFinished(barberShopEvent, eventTime, systemState);
		}
	}
}

export function simulate(
	initialEvents: BarberShopSimEvent[],
	initialSystemState: BarberShopState,
	simulationTimeMinutes: number,
	handleEvent: EventHandler,
): BarberShopState {
	const eventQueue = new PriorityQueue<BarberShopSimEvent>(
		10, // initial capability of queue
		(a: BarberShopSimEvent, b: BarberShopSimEvent) => a.time - b.time,
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
	simulationState: BarberShopSimState,
	deltaTimeMinutes: number,
	handleEvent: EventHandler,
): BarberShopSimState {
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
): BarberShopState {
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

function randomName(customers: Customer[]): string {
	// Generate a random 'name' on form F.L
	// where F and L are single random letters
	const existingNames = customers.map((customer) => customer.name);
	while (true) {
		const name = `${getRandomLetter()}.${getRandomLetter()}`;
		if (!existingNames.includes(name)) {
			return name;
		}
	}
}

function getRandomLetter(): string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomIndex = Math.floor(Math.random() * alphabet.length);
	return alphabet[randomIndex];
}
