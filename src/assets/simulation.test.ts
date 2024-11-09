import { describe, expect, it } from "vitest";

function levelForXP(totalXP: number) {
	if (totalXP >= 800) return 10;
	if (totalXP >= 540) return 9;
	if (totalXP >= 330) return 8;
	if (totalXP >= 210) return 7;
	if (totalXP >= 130) return 6;
	if (totalXP >= 80) return 5;
	if (totalXP >= 50) return 4;
	if (totalXP >= 30) return 3;
	if (totalXP >= 20) return 2;
	if (totalXP >= 10) return 1;
	return 0;
}

describe("simulation", () => {
	/* level   1 requires 10 xp
      - " -  2 requires 20 xp
      - " -  3   "      20+10 = 30 xp
      - " -  4   "      30 + 20 = 50 xp
      - " -  5   "      50 + 30 = 80 xp
   */
	it("levels and XP", () => {
		expect(levelForXP(0)).toStrictEqual(0);
		expect(levelForXP(9)).toStrictEqual(0);
		expect(levelForXP(10)).toStrictEqual(1);
		expect(levelForXP(19)).toStrictEqual(1);
		expect(levelForXP(20)).toStrictEqual(2);
		expect(levelForXP(29)).toStrictEqual(2);
		expect(levelForXP(30)).toStrictEqual(3);
		expect(levelForXP(49)).toStrictEqual(3);
		expect(levelForXP(50)).toStrictEqual(4);
		expect(levelForXP(80)).toStrictEqual(5);
		expect(levelForXP(130)).toStrictEqual(6);
		expect(levelForXP(210)).toStrictEqual(7);
		expect(levelForXP(330)).toStrictEqual(8);
		expect(levelForXP(540)).toStrictEqual(9);
		expect(levelForXP(800)).toStrictEqual(10);
	});

	//type Skill = "RED" | "BLUE" | "WHITE" | "YELLOW";

	describe("collaborating bird stories", () => {
		function printState(s: State) {
			return `State: ${s.birds}`;
		}

		it("1 bird 1 skill 1 story", () => {
			/* Discrete simulation. The sim starts with input configuration (birds, parameters, backlog, seed)
		and then can take time steps ("ticks") which updates it's state. It can also give a snapshot
		of the state: where birds are, where stories are, what the backlog looks like, finished paintings etc.
		These snapshots can be used to create a 'story board' in approval testing lingua, and also will
		be the basis for the React and svg rendering.
		 */
			let story = "1 bird 1 story 1 skill";
			const input = {
				birds: [
					{
						skillSet: [1, 0, 0, 0],
					},
				],
				backlog: [
					{
						items: "RRRRR",
					},
				],
			};
			const simulation = new Simulation(input);
			for (let i = 0; i < 10; i++) {
				story += `\nTime ${i} state:`;
				story += printState(simulation.state());
				simulation.stepTime(1);
			}
			expect(story).toMatchSnapshot();
		});
	});
});

class Simulation {
	private input: {
		backlog: { items: string }[];
		birds: { skillSet: number[] }[];
	};
	private ms: number;
	constructor(input: {
		backlog: { items: string }[];
		birds: { skillSet: number[] }[];
	}) {
		this.input = input;
		this.ms = 0;
	}

	state() {
		return this.input;
	}

	stepTime(milliseconds: number) {
		this.ms += milliseconds;
	}
}
