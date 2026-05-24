import { expect, test, vi } from "vitest";
import {
  BooleanConverter,
  Converter,
  Input,
  NumberConverter,
  ObjectConverter,
  StringConverter,
} from "../index";

test("input returns the initial value", () => {
  const input = new Input("alpha", new StringConverter());

  expect(input.get()).toBe("alpha");
});

test("input set updates value using provided converter", () => {
  const input = new Input(10, new NumberConverter());

  input.set("25");

  expect(input.get()).toBe(25);
});

test("input set notifies subscribers when parsed value changes", () => {
  const input = new Input(10, new NumberConverter());
  const subscriber = vi.fn();

  input.subscribe(subscriber);
  input.set("20");

  expect(subscriber).toHaveBeenCalledOnce();
  expect(subscriber).toHaveBeenCalledWith(20);
});

test("input set does not notify subscribers when parsed value is unchanged", () => {
  const input = new Input(10, new NumberConverter());
  const subscriber = vi.fn();

  input.subscribe(subscriber);
  input.set("10");

  expect(subscriber).not.toHaveBeenCalled();
});

test("input calls custom converter parse and stringify", () => {
  const converter: Converter<number> = {
    parse: vi.fn((value: unknown) => Number(value) + 1),
    stringify: vi.fn((value: number) => `n:${value}`),
  };
  const input = new Input(0, converter);

  input.set("41");

  expect(converter.parse).toHaveBeenCalledWith("41");
  expect(input.get()).toBe(42);
  expect(input.toString()).toBe("n:42");
  expect(converter.stringify).toHaveBeenCalledWith(42);
});

test("input with string converter supports basic parse and stringify", () => {
  const input = new Input("", new StringConverter());

  input.set(123);

  expect(input.get()).toBe("123");
  expect(input.toString()).toBe("123");
});

test("input with number converter supports basic parse and stringify", () => {
  const input = new Input(0, new NumberConverter());

  input.set("42.5");

  expect(input.get()).toBe(42.5);
  expect(input.toString()).toBe("42.5");
});

test("input with boolean converter supports basic parse and stringify", () => {
  const input = new Input(false, new BooleanConverter());

  input.set("yes");

  expect(input.get()).toBe(true);
  expect(input.toString()).toBe("yes");
});

test("input with object converter supports basic parse and stringify", () => {
  const input = new Input<object>({}, new ObjectConverter() as Converter<object>);

  input.set('{"name":"pxstorm"}');

  expect(input.get()).toEqual({ name: "pxstorm" });
  expect(input.toString()).toBe('{"name":"pxstorm"}');
});

test("input adds default string converter", () => {
  const input = new Input("initial");

  input.set(123);

  expect(input.get()).toBe("123");
  expect(input.toString()).toBe("123");
});

test("input adds default number converter", () => {
  const input = new Input(0);

  input.set("42.5");

  expect(input.get()).toBe(42.5);
  expect(input.toString()).toBe("42.5");
});

test("input adds default boolean converter", () => {
  const input = new Input(false);

  input.set("yes");

  expect(input.get()).toBe(true);
  expect(input.toString()).toBe("yes");
});

test("input adds default object converter", () => {
  const input = new Input<object>({});

  input.set('{"name":"default"}');

  expect(input.get()).toEqual({ name: "default" });
  expect(input.toString()).toBe('{"name":"default"}');
});