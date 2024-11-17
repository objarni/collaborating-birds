import "./App.css";
import { useEffect, useState } from "react";
import type { Event, SystemState } from "./barbershop.ts";

const SomeOtherComponent = () => (
	<svg viewBox="0 0 100 100">
		<circle cx={50} cy={50} r={30} fill="red" />
		<circle cx={5} cy={50} r={30} fill="white" />
	</svg>
);

interface BarberShopProps {
	state: SystemState;
}

function BarberShop({ state }: BarberShopProps) {
	return (
		<div>
			<h1>Chairs</h1>
			{state.chairs[0]}
			<h1>Sofa</h1>
			{state.seats[0]}
		</div>
	);
}

function App() {
	const [systemState] = useState<SystemState>({
		money: 0,
		missedClients: 0,
		seats: ["EMPTY"],
		chairs: ["EMPTY"],
	});
	// const [eventQueue, setEventQueue] = useState<PriorityQueue<Event>>(10, (a: Event, b: Event) => a.time - b.time));
	//
	// const [systemTime, setSystemTime] = useState<number>(0);
	//
	// useEffect(() => {
	// 	const intervalId = setInterval(() => {
	// 		const newTime = systemTime + 1;
	//
	// 		setSystemState(systemState);
	// 		setSystemTime(newTime);
	// 	}, 50); // 1000 milliseconds = 1 second
	//
	// 	// Cleanup function to clear interval when the component unmounts
	// 	return () => clearInterval(intervalId);
	// }, [systemState]);

	return (
		<>
			<div id="app">
				<SomeOtherComponent />
				<BarberShop state={systemState} />
			</div>
		</>
	);
}

export default App;
