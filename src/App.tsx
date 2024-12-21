import "./App.css";
import { PriorityQueue } from "priority-queue-typescript";
import { useEffect, useState } from "react";
import {
	barberShopEventHandler,
	initialBarberShopState,
	simStep,
} from "./barbershop.ts";
import type {
	BarberShopSimEvent,
	BarberShopSimState,
	BarberShopState,
} from "./barbershop.types.ts";

interface BarberShopProps {
	minutes: number;
	state: BarberShopState;
}

function Statistics({ state, minutes }: BarberShopProps) {
	return (
		<div>
			<h2>Simulation Time (minutes)</h2>
			{minutes}
			<h2>Missed customers</h2>
			{state.missedClients}
			<h2>Cash total (SEK)</h2>
			{state.money}
			<h2>Active customers</h2>
			{state.customers.length}
		</div>
	);
}

function initialSimState(chairs: number, seats: number) {
	const initialSystemState = initialBarberShopState(chairs, seats);
	const initialEvents: BarberShopSimEvent[] = [
		{
			time: 0,
			kind: {
				kind: "CUSTOMER_ARRIVED",
				arrivingCustomer: "A.A",
			},
		},
	];
	const eventQueue = new PriorityQueue<BarberShopSimEvent>(
		10, // initial capability of queue
		(a: BarberShopSimEvent, b: BarberShopSimEvent) => a.time - b.time,
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

function Person() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 150"
			width="30"
			height="40"
		>
			<title>Person Icon</title>
			<circle cx="50" cy="30" r="15" fill="black" />
			<line x1="50" y1="45" x2="50" y2="90" stroke="black" strokeWidth="5" />
			<line x1="50" y1="60" x2="20" y2="80" stroke="black" strokeWidth="5" />
			<line x1="50" y1="60" x2="80" y2="80" stroke="black" strokeWidth="5" />
			<line x1="50" y1="90" x2="30" y2="130" stroke="black" strokeWidth="5" />
			<line x1="50" y1="90" x2="70" y2="130" stroke="black" strokeWidth="5" />
		</svg>
	);
}

function App() {
	const [showStats, setShowStats] = useState(false);
	const [simState, setSimState] = useState<BarberShopSimState>(
		initialSimState(2, 2),
	);

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (showStats) return;
			const newSimState = simStep(simState, 1, barberShopEventHandler);
			setSimState(newSimState);
		}, 300); // 1000 milliseconds = 1 second

		// Cleanup function to clear interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [simState, showStats]);

	return (
		<div className="app">
			<div className={"simulation"}>
				<div className={"chairs"}>Chairs</div>
				<div className={"sofa"}>Sofa</div>
				{simState.systemState.customers.map((customer) => (
					<div
						className={`client ${customer.place.kind}-${customer.place.which}`}
						key={customer.name}
					>
						<Person />
						<div className={""}>{customer.name}</div>
					</div>
				))}
			</div>
			<div className={"statistics"}>
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
		</div>
	);
}

export default App;
