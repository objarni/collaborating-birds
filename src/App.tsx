import "./App.css";
import PriorityQueue from "priority-queue-typescript";
import { useEffect, useState } from "react";
import {
	type Event,
	type SimulationState,
	type SystemState,
	barberShopEventHandler,
	initialBarberShopState,
	simStep,
} from "./barbershop.ts";

const SomeOtherComponent = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg viewBox="0 0 100 100">
		<circle cx={50} cy={50} r={30} fill="red" />
		<circle cx={5} cy={50} r={30} fill="white" />
	</svg>
);

interface BarberShopProps {
	minutes: number;
	state: SystemState;
}

function BarberShop({ state, minutes }: BarberShopProps) {
	return (
		<div>
			<h1>Chairs</h1>
			{state.chairs.map((chair, index) => (
				<p key={index}>
					{index + 1}. {chair}
				</p>
			))}
			<h1>Sofa</h1>
			{state.seats.map((seat, index) => (
				<p key={index}>
					{index + 1}. {seat}
				</p>
			))}
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
	const initialEvents: Event[] = [
		{
			time: 0,
			kind: "CUSTOMER_ARRIVED",
		},
	];
	const eventQueue = new PriorityQueue<Event>(
		10, // initial capability of queue
		(a: Event, b: Event) => a.time - b.time,
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
	const [simState, setSimState] = useState<SimulationState>(
		initialSimState(1, 1),
	);

	useEffect(() => {
		const intervalId = setInterval(() => {
			const newSimState = simStep(simState, 1, barberShopEventHandler);
			setSimState(newSimState);
		}, 1000); // 1000 milliseconds = 1 second

		// Cleanup function to clear interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [simState]);

	return (
		<>
			<div id="app">
				<SomeOtherComponent />
				<BarberShop state={simState.systemState} minutes={simState.time} />
			</div>
		</>
	);
}

export default App;
