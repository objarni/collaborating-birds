import "./App.css";
import PriorityQueue from "priority-queue-typescript";
import { useEffect, useState } from "react";
import {
	type SimEvent,
	type SimulationState,
	type SystemState,
	barberShopEventHandler,
	initialBarberShopState,
	simStep,
} from "./barbershop.ts";

interface BarberShopProps {
	minutes: number;
	state: SystemState;
}

function Statistics({ state, minutes }: BarberShopProps) {
	return (
		<div>
			<h2>Simulation Time (minutes)</h2>
			{minutes}
			<h2>Missed clients</h2>
			{state.missedClients}
			<h2>Cash total (SEK)</h2>
			{state.money}
		</div>
	);
}

function initialSimState(chairs: number, seats: number) {
	const initialSystemState = initialBarberShopState(chairs, seats);
	const initialEvents: SimEvent[] = [
		{
			time: 0,
			kind: {
				kind: "CUSTOMER_ARRIVED",
				arrivingCustomer: "A.A",
			},
		},
	];
	const eventQueue = new PriorityQueue<SimEvent>(
		10, // initial capability of queue
		(a: SimEvent, b: SimEvent) => a.time - b.time,
	);
	for (const event of initialEvents) {
		eventQueue.add(event);
	}
	return {
		time: 0,
		systemState: initialSystemState,
		eventQueue: eventQueue,
	};
}

function App() {
	const [showStats, setShowStats] = useState(false);
	const [simState, setSimState] = useState<SimulationState>(
		initialSimState(2, 2),
	);

	useEffect(() => {
		const intervalId = setInterval(() => {
			const newSimState = simStep(simState, 1, barberShopEventHandler);
			setSimState(newSimState);
		}, 300); // 1000 milliseconds = 1 second

		// Cleanup function to clear interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [simState]);

	return (
		<>
			<div id="app">
				<div id="statistics">
					<label>
						<input
							type={"checkbox"}
							className={"statistics-checkbox"}
							onChange={() => setShowStats(!showStats)}
						/>
						<h2 className={"subtle-border"}>Statistics?</h2>
					</label>
					{showStats && (
						<Statistics state={simState.systemState} minutes={simState.time} />
					)}
				</div>
				<div id="simulation">
					{simState.systemState.customers.map((customer) => (
						<div
							className={`${customer.place.kind}-${customer.place.which}`}
							key={customer.name}
						>
							{customer.name}
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export default App;
