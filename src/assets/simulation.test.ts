import { describe, expect, it } from "vitest";

function levelForXP(totalXP: number) {
	if (totalXP < 10) return 0;
	return 1;
}

describe("simulation", () => {
	/* levelling up from 0 requires 10 xp
      - " -  1 requires 20 xp
      - " -  2   "      20+10 = 30 xp
      - " -  3   "      30 + 20 = 50 xp
   */
	it("levels and XP", () => {
		expect(levelForXP(0)).toStrictEqual(0);
		expect(levelForXP(9)).toStrictEqual(0);
		expect(levelForXP(10)).toStrictEqual(1);
	});
});
