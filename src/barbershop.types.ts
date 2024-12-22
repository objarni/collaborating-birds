import type { HandlerResult } from "./discrete-event-simulation-typescript/handlerresult.ts";
import type { SimEvent } from "./discrete-event-simulation-typescript/simevent.ts";
import type { SimulationState } from "./discrete-event-simulation-typescript/simulationstate.ts";

export interface BarberShopState {
	missedClients: number;
	money: number;
	chairs: ChairStates[];
	seats: SeatStates[];
	customers: Customer[];
}

export type ChairStates =
	| { state: "EMPTY" }
	| { state: "CUTTING_HAIR"; customerName: string };

type SeatStates =
	| { state: "EMPTY" }
	| { state: "WAITING_TO_CUT_HAIR"; customerName: string; sitDownTime: number };

export type BarberShopEvent =
	| { kind: "CUSTOMER_ARRIVED"; arrivingCustomer: string }
	| { kind: "CUSTOMER_DECIDED"; decidedCustomer: string }
	| { kind: "CUSTOMER_FINISHED"; finishedCustomer: string; chair: number };

export type Customer = {
	name: string;
	place: Place;
};

export type Place = {
	kind: "Chair" | "Seat" | "AtWindow";
	which: number;
};

export type BarberShopSimEvent = SimEvent<BarberShopEvent>;

export type BarberShopSimState = SimulationState<
	BarberShopSimEvent,
	BarberShopState
>;

export type BarberShopHandlerResult = HandlerResult<
	BarberShopState,
	BarberShopEvent
>;

export type EventHandler<SystemStateType, EventType> = (
	state: SystemStateType,
	event: SimEvent<EventType>,
) => HandlerResult<SystemStateType, EventType>;

export type BarberShopEventHandler = EventHandler<
	BarberShopState,
	BarberShopEvent
>;
