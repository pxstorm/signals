import { Signal } from "./signal";

/**
 * A computed signal that automatically updates its value
 * based on other signals it depends on (used in callback).
 */
export class Computed<T> extends Signal<T> {
  constructor(private compute: () => T) {
    super(Signal.watchFirst(compute, () => this.recompute()));
  }

  /**
   * Recompute the value by calling the compute function
   * and notify subscribers of the change.
   *
   * Watch the compute function for any signals it uses,
   * and automatically re-run (on next tick) when any of those signals change.
   */
  public recompute(): void {
    const newValue = Signal.watchFirst(this.compute, () => this.recompute());
    if (newValue !== this.value) {
      this.value = newValue;
      this.valueChanged();
    }
  }
}