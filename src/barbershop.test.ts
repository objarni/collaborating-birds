import { describe, expect, it } from "vitest";
import {
	barberShopEventHandler,
	initialBarberShopState,
	simulateBarberShop,
} from "./barbershop.ts";
import type { BarberShopSimEvent } from "./barbershop.types.ts";

describe("Barbershop", () => {
	/* A barber shop simulation.
	C number of chairs, with a hair cut time of 20 minutes.
	A wait sofa area of S seats. If all seats are full, customers do not enter shop.
	Customers arrive every 10 minutes.
	Every finished hair cut goes to a till which gives shop 200 kr, process time 2 minutes.
	There is a queue length to the till of 0 - only one client at a time. If someone is
	at the till, and a client is done with a hair cut, the person waits in the chair.

	State in the system:
	 - every chair is in either EMPTY, CUTTING_HAIR or WAITING_TO_PAY state.
	 - every sofa seat is either EMPTY of WAITING_TO_CUT_HAIR.
	 This is all state that is needed to determine what happens when
	 a customer arrives.

   */
	const initialEvent: BarberShopSimEvent[] = [
		{
			time: 0,
			kind: {
				kind: "CUSTOMER_ARRIVED",
				arrivingCustomer: "A.A",
			},
		},
	];

	it("1 chair 1 seat 8 hours", () => {
		const initialState = initialBarberShopState(1, 1);
		const resultingState = simulateBarberShop(
			initialEvent,
			initialState,
			8 * 60, //minutes
			barberShopEventHandler,
		);
		expect(resultingState.money).toBeGreaterThanOrEqual(2000);
		expect(resultingState.missedClients).toBeGreaterThanOrEqual(20);
	});
	it("2 chairs 1 seat 8 hours", () => {
		const initialState = initialBarberShopState(2, 1);
		const resultingState = simulateBarberShop(
			initialEvent,
			initialState,
			8 * 60, //minutes
			barberShopEventHandler,
		);
		expect(resultingState.money).toBeGreaterThanOrEqual(4000);
		expect(resultingState.missedClients).toBeGreaterThanOrEqual(8);
	});
	it("1 chair 2 seats 8 hours", () => {
		const initialState = initialBarberShopState(1, 2);
		const resultingState = simulateBarberShop(
			initialEvent,
			initialState,
			8 * 60, //minutes
			barberShopEventHandler,
		);
		expect(resultingState.money).toBeGreaterThanOrEqual(1800);
		expect(resultingState.money).toBeLessThanOrEqual(3000);
		expect(resultingState.missedClients).toBeGreaterThanOrEqual(20);
	});
});
