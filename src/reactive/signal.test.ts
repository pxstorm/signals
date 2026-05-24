import { expect, test, vi, afterEach, describe, beforeAll } from "vitest";
import { Signal } from "./signal";
import { Value } from "./value";
import { Computed } from "./computed";

beforeAll(() => vi.useFakeTimers());

describe("signal tracking", () => {
  test("track returns callback result and tracks used signals", () => {
    const signal1 = new Value(10);
    const signal2 = new Value(20);

    const [result, usedSignals] = Signal.track(() => {
      return signal1.get() + signal2.get();
    });

    expect(result).toBe(30);
    expect(usedSignals.size).toBe(2);
    expect(usedSignals.has(signal1)).toBe(true);
    expect(usedSignals.has(signal2)).toBe(true);
  });

  test("track does not track signals not used in callback", () => {
    const signal1 = new Value(10);
    const signal2 = new Value(20);
    const signal3 = new Value(30);

    const [result, usedSignals] = Signal.track(() => {
      return signal1.get() + signal3.get();
    });

    expect(result).toBe(40);
    expect(usedSignals.size).toBe(2);
    expect(usedSignals.has(signal2)).toBe(false);
  });

  test("track tracks same signal multiple times as single reference", () => {
    const signal = new Value(5);

    const [result, usedSignals] = Signal.track(() => {
      return signal.get() + signal.get();
    });

    expect(result).toBe(10);
    expect(usedSignals.size).toBe(1);
    expect(usedSignals.has(signal)).toBe(true);
  });

  test("track with empty tracking returns empty set", () => {
    const [result, usedSignals] = Signal.track(() => {
      return 42;
    });

    expect(result).toBe(42);
    expect(usedSignals.size).toBe(0);
  });
});

describe("signal watching", () => {
  test("watchFirst calls onChange when tracked signal changes", async () => {
    const signal = new Value(10);
    const onChange = vi.fn();

    Signal.watchFirst(() => signal.get(), onChange);
    signal.set(20);

    await vi.runAllTimersAsync();
    expect(onChange).toHaveBeenCalledOnce();
  });

  test("watchFirst unsubscribes from signals before calling onChange", async () => {
    const signal = new Value(10);
    const onChange = vi.fn();

    Signal.watchFirst(() => signal.get(), onChange);

    signal.set(20);
    await vi.runAllTimersAsync();

    // Second change should not trigger onChange since we unsubscribed
    signal.set(30);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
  });

  test("watchFirst returns initial value", () => {
    const signal = new Value(42);
    const onChange = vi.fn();

    const result = Signal.watchFirst(() => signal.get() * 2, onChange);

    expect(result).toBe(84);
  });

  test("watchFirst triggers onChange only once if multiple signals change", async () => {
    const signal1 = new Value(10);
    const signal2 = new Value(20);
    const onChange = vi.fn();

    Signal.watchFirst(() => {
      return signal1.get() + signal2.get();
    }, onChange);

    signal1.set(17);
    signal2.set(50);
    await vi.runAllTimersAsync();
    expect(onChange).toHaveBeenCalledOnce();
  });

  test("watch returns callback result and AbortController", () => {
    const signal = new Value(10);

    const [result, abortController] = Signal.watch(() => signal.get(), () => {});

    expect(result).toBe(10);
    expect(abortController).toBeInstanceOf(AbortController);
    abortController.abort();
  });

  test("watch calls onChange with new value when tracked signal changes", async () => {
    const signal = new Value(10);
    const onChange = vi.fn();

    const [result, abortController] = Signal.watch(() => signal.get(), onChange);

    expect(result).toBe(10);
    expect(onChange).not.toHaveBeenCalled();

    signal.set(20);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(20);
    abortController.abort();
  });

  test("watch continues to watch signals until aborted", async () => {
    const signal = new Value(10);
    const onChange = vi.fn();

    const [, abortController] = Signal.watch(() => signal.get(), onChange);

    signal.set(20);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledWith(20);

    signal.set(30);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledWith(30);
    abortController.abort();
  });

  test("watch AbortController stops watching signals", async () => {
    const signal = new Value(10);
    const onChange = vi.fn();

    const [, abortController] = Signal.watch(() => signal.get(), onChange);

    signal.set(20);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
    abortController.abort();

    signal.set(30);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
  });

  test("watch handles computed values changes correctly", async () => {
    const source = new Value(5);
    const computed = new Computed(() => source.get() * 2);
    const onChange = vi.fn();

    const [, abortController] = Signal.watch(() => computed.get(), onChange);
    expect(onChange).not.toHaveBeenCalled();

    source.set(10);
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(20);
    abortController.abort();
  });
});