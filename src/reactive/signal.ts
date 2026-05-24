type SignalCallback<T> = (value: T) => void;

/**
 * Base class for reactive signals that can hold a value and notify subscribers of changes.
 */
export abstract class Signal<T = unknown> {
  protected value!: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  // #region Getters
  /**
   * Get the current value.
   *
   * @returns The current value or undefined if not set.
   */
  public get(): T {
    this.valueReaded();
    return this.value;
  }

  /**
   * Convert the signal's value to a string representation.
   *
   * @returns JSON string representation of the current value.
   */
  public toString(): string {
    this.valueReaded();
    if (typeof this.value === 'object') {
      return JSON.stringify(this.value);
    }

    return this.value?.toString() ?? '';
  }
  // #endregion

  // #region Subscribers
  /**
   * Set of subscribers to be notified on value changes.
   */
  private readonly subscribers: Set<SignalCallback<T>> = new Set();

  /**
   * Subscribe to value changes.
   *
   * @param callback
   */
  public subscribe(callback: SignalCallback<T>): void {
    this.subscribers.add(callback);
  }

  /**
   * Unsubscribe from value changes.
   *
   * @param callback
   */
  public unsubscribe(callback: SignalCallback<T>): void {
    if (!this.subscribers.delete(callback)) {
      throw new Error("Failed to unsubscribe from signal, callback not registered.");
    }
  }

  /**
   * Try to unsubscribe from value changes without throwing an error if the callback is not registered.
   *
   * @param callback
   * @return true if the callback was successfully unsubscribed, false if the callback was not registered.
   */
  public tryUnsubscribe(callback: SignalCallback<T>): boolean {
    return this.subscribers.delete(callback);
  }
  // #endregion

  // #region Event handlers
  /**
   * Add the signal to list of used signals.
   *
   * Used to track all signals used by given piece of code (e.g. computed signal).
   */
  private valueReaded(): void {
    Signal.trackingContexts.forEach(c => c.add(this));
  }

  /**
   * Notify subscribers of value changes.
   */
  protected valueChanged(): void {
    this.subscribers.forEach(callback => callback(this.value));
  }
  // #endregion

  // #region Tracking
  /**
   * Set of active tracking contexts used to get list of used signals.
   */
  private static readonly trackingContexts: Set<Signal<any>>[] = [];

  /**
   * Track all signals used in the given callback.
   *
   * @example
   * const [value, usedSignals] = Signal.track(() => {
   *   // Your code that uses signals
   * });
   */
  public static track<T = void>(callback: () => T): [T, Set<Signal<any>>] {
    this.startTracking();
    const value = callback();
    return [value, this.stopTracking()];
  }

  /**
   * Start a new tracking context for signals.
   */
  private static startTracking(): void {
    this.trackingContexts.push(new Set());
  }

  /**
   * Stop the current tracking context and return the set of signals used in it.
   *
   * @returns Set of signals used in the current tracking context.
   * @throws Error if there is no active tracking context to stop.
   */
  private static stopTracking(): Set<Signal<any>> {
    const signals = this.trackingContexts.pop();
    if (signals === undefined) {
      throw new Error("Cannot stop tracking: no tracking context is currently active.");
    }

    return signals;
  }

  // #endregion

  // #region Reactive methods
  /**
   * Watch the first signal value change used in callback.
   *
   * @param callback The callback to execute and track signals used in it.
   * @param onChange The callback to execute on next tick when any of the used signals changes.
   * @returns The value returned by the callback.
   */
  public static watchFirst<T>(callback: () => T, onChange: () => void): T {
    const [value, usedSignals] = this.track<T>(callback);

    const onChangeHandler = () => {
      usedSignals.forEach(s => s.unsubscribe(onChangeHandler));
      setTimeout(() => onChange(), 0);
    };

    usedSignals.forEach(s => s.subscribe(onChangeHandler));

    return value;
  }

  /**
   * Watch all signal value changes used in callback.
   *
   * @param callback The callback to execute and track signals used in it.
   * @param onChange The callback to execute on next tick when any of the used signals changes, with the new value.
   * @returns A tuple containing the initial value and an AbortController to stop watching.
   */
  public static watch<T>(callback: () => T, onChange: (value:T) => void): [T, AbortController] {
    let [value, usedSignals] = this.track<T>(callback);
    let onChangeTimeut: ReturnType<typeof setTimeout>|undefined;

    const onChangeHandler = () => {
      usedSignals.forEach(s => s.unsubscribe(onChangeHandler));
      onChangeTimeut = setTimeout(() => {
        [value, usedSignals] = this.track<T>(callback);
        usedSignals.forEach(s => s.subscribe(onChangeHandler));
        onChange(value);
      });
    };

    usedSignals.forEach(s => s.subscribe(onChangeHandler));

    const abortController = new AbortController();
    abortController.signal.addEventListener("abort", () => {
      onChangeTimeut && clearTimeout(onChangeTimeut);
      usedSignals.forEach(s => s.tryUnsubscribe(onChangeHandler));
    });

    return [value, abortController];
  }
  // #endregion
}