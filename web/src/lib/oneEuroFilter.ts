/** 1-Euro filter for smoothing jittery landmark streams. */
class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  constructor(private alpha: number) {}

  filter(value: number): number {
    if (this.y === null || this.s === null) {
      this.y = value;
      this.s = value;
      return value;
    }
    this.s = this.alpha * value + (1 - this.alpha) * this.s;
    this.y = this.s;
    return this.y;
  }

  setAlpha(alpha: number) {
    this.alpha = alpha;
  }
}

function smoothingFactor(te: number, cutoff: number) {
  const r = 2 * Math.PI * cutoff * te;
  return r / (r + 1);
}

export class OneEuroFilter {
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number | null = null;
  private lastValue: number | null = null;

  constructor(
    private minCutoff = 1.0,
    private beta = 0.007,
    private dCutoff = 1.0
  ) {
    this.xFilter = new LowPassFilter(1);
    this.dxFilter = new LowPassFilter(1);
  }

  filter(value: number, timestampMs: number): number {
    const t = timestampMs / 1000;
    if (this.lastTime === null || this.lastValue === null) {
      this.lastTime = t;
      this.lastValue = value;
      this.xFilter.filter(value);
      this.dxFilter.filter(0);
      return value;
    }

    const te = Math.max(t - this.lastTime, 1e-6);
    const dx = (value - this.lastValue) / te;
    this.dxFilter.setAlpha(smoothingFactor(te, this.dCutoff));
    const edx = this.dxFilter.filter(dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    this.xFilter.setAlpha(smoothingFactor(te, cutoff));
    const filtered = this.xFilter.filter(value);
    this.lastTime = t;
    this.lastValue = filtered;
    return filtered;
  }

  reset() {
    this.lastTime = null;
    this.lastValue = null;
  }
}

export class LandmarkFilterBank {
  private filters: OneEuroFilter[] = [];

  constructor(
    count: number,
    private minCutoff = 1.2,
    private beta = 0.01
  ) {
    for (let i = 0; i < count * 3; i++) {
      this.filters.push(new OneEuroFilter(minCutoff, beta));
    }
  }

  apply(
    landmarks: { x: number; y: number; z: number }[],
    timestampMs: number
  ): { x: number; y: number; z: number }[] {
    return landmarks.map((lm, i) => ({
      x: this.filters[i * 3].filter(lm.x, timestampMs),
      y: this.filters[i * 3 + 1].filter(lm.y, timestampMs),
      z: this.filters[i * 3 + 2].filter(lm.z, timestampMs),
    }));
  }

  reset() {
    this.filters.forEach((f) => f.reset());
  }
}
