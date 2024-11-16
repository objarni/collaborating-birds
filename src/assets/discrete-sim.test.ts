import PriorityQueue from "priority-queue-typescript";
import { describe, expect, it } from "vitest";

describe("Drops in bathtub", () => {
	/* A simulation of drops filling a bathtub.
  Events:
   - DropLeftTap. Every time this happens, a new drophitwater and droplefttab is added to queue.
   - DropHitWater. Every time this happens, the amount of water in tub increases.
  System:
   This only has one state: the amount of water in the tub.
   Drops are assumed of same volume - 0.05 ml.
   The tub dimension is 300 liters.

   */
	it("works", () => {
		const initialEvents: Event[] = [
			{
				time: 0,
				kind: "DropLeftTap",
			},
		];
		const systemState = {
			waterAmountLiters: 0,
		};
		const resultingState = simulate(initialEvents, systemState, 2000);
		expect(resultingState.waterAmountLiters - 50).toBeLessThan(0.001);
	});
});

type EventKind = "DropLeftTap" | "DropHitWater";

interface SystemState {
	waterAmountLiters: number;
}

interface Event {
	time: number;
	kind: EventKind;
}

function simulate(
	initialEvents: Event[],
	systemState: SystemState,
	eventCount: number,
): SystemState {
	const eventQueue = new PriorityQueue<Event>(
		10, // initial capability of queue
		(a: Event, b: Event) => a.time - b.time,
	);
	for (const event of initialEvents) {
		eventQueue.add(event);
	}
	let currentTimeSeconds = 0;
	let currentSystemState = { ...systemState };
	for (let i = 0; i < eventCount; ++i) {
		const nextEvent = eventQueue.poll();
		if (nextEvent === null) return currentSystemState;
		switch (nextEvent.kind) {
			case "DropLeftTap": {
				console.log(`A drop left tap at time=${nextEvent.time}.`);
				currentTimeSeconds = nextEvent.time;
				eventQueue.add({
					time: currentTimeSeconds + 5.0,
					kind: "DropLeftTap",
				});
				// The time it takes the drop to hit the surface depends
				// on how much water is in tub!
				const waterHeightMeters =
					0.5 * (currentSystemState.waterAmountLiters / 300.0);
				console.log(`The surface height is ${waterHeightMeters} meters.`);
				// Gross simplification: Assume drops fall with linear speed.
				// Tap is 20 cm above tap, so max fall is 70 cm, min fall 20 cm.
				// Drops fall with 5 m / s.
				const fallDistance = 0.2 + 0.5 - waterHeightMeters;
				console.log(`The drop will fall ${fallDistance} meters.`);
				// s = v*t, so t = s/v
				const timeInAir = fallDistance / 5.0;
				eventQueue.add({
					time: currentTimeSeconds + timeInAir,
					kind: "DropHitWater",
				});
				break;
			}
			case "DropHitWater": {
				console.log(`A drop hit water surface at time=${nextEvent.time}.`);
				currentSystemState = {
					waterAmountLiters: currentSystemState.waterAmountLiters + 0.05,
				};
				console.log(
					`The tub now contains ${currentSystemState.waterAmountLiters} liters of water.`,
				);
			}
		}
	}
	return currentSystemState;
}
