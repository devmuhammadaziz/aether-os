import { length3 } from "./coords";
import type { HandFrame, IntentState } from "./types";

/**
 * Lightweight predictive intent classifier.
 * Hands present + any gesture ⇒ interacting. Idle stillness ⇒ resting.
 */
export class IntentClassifier {
  private samples: number[] = [];
  private readonly window = 12;
  private state: IntentState = "resting";

  update(hands: HandFrame[]): IntentState {
    if (hands.length === 0) {
      this.samples.push(0);
    } else {
      const gesturing = hands.some((h) => h.pinch || h.fist || h.openPalm);
      if (gesturing) {
        this.state = "interacting";
        this.samples.push(1);
      } else {
        const speed =
          hands.reduce((acc, h) => acc + length3(h.velocity), 0) / hands.length;
        this.samples.push(Math.min(1, speed * 0.8 + 0.15));
      }
    }

    if (this.samples.length > this.window) this.samples.shift();
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;

    if (hands.length > 0 && avg > 0.18) this.state = "interacting";
    else if (avg < 0.08) this.state = "resting";

    // If a hand is visible, default to interacting so grabs aren't blocked
    if (hands.length > 0 && this.state === "resting" && avg > 0.05) {
      this.state = "interacting";
    }

    return this.state;
  }

  get(): IntentState {
    return this.state;
  }
}
