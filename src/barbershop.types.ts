import type { EventHandler } from "./discrete-event-simulation-typescript/eventhandler.ts";
import type { HandlerResult } from "./discrete-event-simulation-typescript/handlerresult.ts";
import type {SimEvent, SimState} from "./discrete-event-simulation-typescript/simevent.ts";

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

export type BarberShopSimState = SimState<
	BarberShopEvent,
	BarberShopState
>;

export type BarberShopHandlerResult = HandlerResult<
	BarberShopEvent,
	BarberShopState
>;

export type BarberShopEventHandler = EventHandler<
	BarberShopEvent,
	BarberShopState
>;
