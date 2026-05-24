import { beforeAll, expect, test, vi } from "vitest";
import { Computed, Value } from "../index";

beforeAll(() => vi.useFakeTimers());

test("computed returns initial computed value", () => {
  const source = new Value(2);
  const computed = new Computed(() => source.get() * 3);

  expect(computed.get()).toBe(6);
});

test("computed tracks dependencies and updates after source change", async () => {
  const source = new Value(10);
  const computed = new Computed(() => source.get() + 5);

  source.set(20);
  await vi.runAllTimersAsync();

  expect(computed.get()).toBe(25);
});

test("computed notifies subscribers when computed value changes", async () => {
  const source = new Value(1);
  const computed = new Computed(() => source.get() * 10);
  const subscriber = vi.fn();

  computed.subscribe(subscriber);

  source.set(2);
  await vi.runAllTimersAsync();

  expect(subscriber).toHaveBeenCalledOnce();
  expect(subscriber).toHaveBeenCalledWith(20);
  computed.tryUnsubscribe(subscriber);
});

test("computed does not notify subscribers when computed value is unchanged", async () => {
  const source = new Value(1);
  const computed = new Computed(() => source.get() % 2);
  const subscriber = vi.fn();

  computed.subscribe(subscriber);

  source.set(3);
  await vi.runAllTimersAsync();

  expect(computed.get()).toBe(1);
  expect(subscriber).not.toHaveBeenCalled();
  computed.tryUnsubscribe(subscriber);
});

test("computed can be manually recomputed", () => {
  const source = new Value(4);
  const computed = new Computed(() => source.get() * 2);

  expect(computed.get()).toBe(8);

  source.set(7);
  computed.recompute();

  expect(computed.get()).toBe(14);
});

test("computed toString returns string representation of computed value", () => {
  const source = new Value(5);
  const computed = new Computed(() => ({ doubled: source.get() * 2 }));

  expect(computed.toString()).toBe('{"doubled":10}');
});

test("computed recomputes once when multiple dependencies change in the same tick", async () => {
  const sourceA = new Value(1);
  const sourceB = new Value(2);
  const compute = vi.fn(() => sourceA.get() + sourceB.get());
  const computed = new Computed(compute);

  expect(compute).toHaveBeenCalledTimes(1);
  expect(computed.get()).toBe(3);

  sourceA.set(10);
  sourceB.set(20);

  await vi.runAllTimersAsync();

  expect(computed.get()).toBe(30);
  expect(compute).toHaveBeenCalledTimes(2);
});

test("computed updates when any of multiple dependencies changes", async () => {
  const sourceA = new Value(2);
  const sourceB = new Value(3);
  const computed = new Computed(() => sourceA.get() + sourceB.get());

  sourceA.set(10);
  await vi.runAllTimersAsync();
  expect(computed.get()).toBe(13);

  sourceB.set(7);
  await vi.runAllTimersAsync();
  expect(computed.get()).toBe(17);
});

test("computed get called multiple times does not trigger recompute", () => {
  const source = new Value(5);
  const compute = vi.fn(() => source.get() * 2);
  const computed = new Computed(compute);

  expect(compute).toHaveBeenCalledTimes(1);

  expect(computed.get()).toBe(10);
  expect(computed.get()).toBe(10);
  expect(computed.get()).toBe(10);

  expect(compute).toHaveBeenCalledTimes(1);
});