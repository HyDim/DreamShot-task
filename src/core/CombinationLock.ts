type Direction = "CW" | "CCW";

export interface ComboPair {
  steps: number;
  direction: Direction;
}

export type CombinationResult = "continue" | "correct" | "wrong";

export default class CombinationLock {
  private combination: ComboPair[] = [];
  private currentPairIndex = 0;
  private currentSteps = 0;
  private currentDirection: Direction | null = null;

  constructor() {
    this.generate();
  }

  generate() {
    this.combination = [];
    const startDirection: Direction = Math.random() < 0.5 ? "CW" : "CCW";

    for (let i = 0; i < 3; i++) {
      const steps = Math.floor(Math.random() * 9) + 1;
      const direction: Direction =
        i % 2 === 0 ? startDirection : startDirection === "CW" ? "CCW" : "CW";

      this.combination.push({ steps, direction });
    }

    console.log(
      "%c🔐 Secret Combination: " +
        this.combination
          .map((p) => `${p.steps} ${p.direction}`)
          .join(", "),
      "color: gold; font-size: 16px; font-weight: bold;"
    );

    this.reset();
  }

  private reset() {
    this.currentPairIndex = 0;
    this.currentSteps = 0;
    this.currentDirection = null;
  }

  getExpectedDirection(): Direction {
    return this.combination[this.currentPairIndex].direction;
  }

  input(direction: Direction): CombinationResult {
    const expected = this.combination[this.currentPairIndex];

    // first input or same direction — accumulate steps
    if (this.currentDirection === null || this.currentDirection === direction) {
      this.currentDirection = direction;
      this.currentSteps++;

      // check if wrong direction from the start
      if (this.currentDirection !== expected.direction) {
        return "wrong";
      }

      // check if they've exceeded the expected steps
      if (this.currentSteps > expected.steps) {
        return "wrong";
      }

      // last pair completed with exact steps
      if (
        this.currentPairIndex === 2 &&
        this.currentSteps === expected.steps
      ) {
        return "correct";
      }

      return "continue";
    }

    // direction changed — validate the previous pair
    if (this.currentSteps !== expected.steps) {
      return "wrong";
    }

    // previous pair was correct, move to next
    this.currentPairIndex++;
    this.currentSteps = 1;
    this.currentDirection = direction;

    // validate the new direction matches the new expected pair
    const newExpected = this.combination[this.currentPairIndex];
    if (direction !== newExpected.direction) {
      return "wrong";
    }

    return "continue";
  }

  getCombination(): readonly ComboPair[] {
    return this.combination;
  }
}
