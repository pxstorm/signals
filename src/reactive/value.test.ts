import { expect, test, vi } from "vitest";
import { Value } from "../index";

test("value returns the initial value", () => {
  const value = new Value(10);

  expect(value.get()).toBe(10);
});

test("value set updates the stored value", () => {
  const value = new Value(10);

  value.set(25);

  expect(value.get()).toBe(25);
});

test("value set notifies subscribers when the value changes", () => {
  const value = new Value(10);
  const subscriber = vi.fn();

  value.subscribe(subscriber);
  value.set(25);

  expect(subscriber).toHaveBeenCalledOnce();
  expect(subscriber).toHaveBeenCalledWith(25);
});

test("value set does not notify subscribers when the value stays the same", () => {
  const value = new Value(10);
  const subscriber = vi.fn();

  value.subscribe(subscriber);
  value.set(10);

  expect(subscriber).not.toHaveBeenCalled();
});

test("value toString reflects the current value", () => {
  const value = new Value(10);

  expect(value.toString()).toBe("10");

  value.set(42);

  expect(value.toString()).toBe("42");
});

test("value supports object values", () => {
  const initial = { name: "alpha" };
  const value = new Value(initial);
  const subscriber = vi.fn();

  value.subscribe(subscriber);

  expect(value.get()).toEqual(initial);
  expect(value.toString()).toBe('{"name":"alpha"}');

  const next = { name: "beta" };
  value.set(next);

  expect(value.get()).toBe(next);
  expect(subscriber).toHaveBeenCalledOnce();
  expect(subscriber).toHaveBeenCalledWith(next);
});

test("value watch only object references changes", () => {
  const initial = { name: "alpha" };
  const value = new Value(initial);
  const subscriber = vi.fn();

  value.subscribe(subscriber);

  value.get().name = "beta";

  expect(subscriber).not.toHaveBeenCalled();
  expect(value.get()).toEqual({ name: "beta" });
});