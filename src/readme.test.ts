import { beforeAll, describe, expect, test, vi } from "vitest";
import {
  BooleanConverter,
  Computed,
  Converter,
  EnumConverter,
  Input,
  NumberConverter,
  ObjectConverter,
  Signal,
  StringConverter,
  Value,
} from "./index";

beforeAll(() => vi.useFakeTimers());

describe("readme / Value", () => {
  test("subscribe is called with the new value when it changes", () => {
    const count = new Value(0);
    const log: number[] = [];

    count.subscribe((next) => log.push(next));

    count.set(1);
    count.set(1); // no notification — value unchanged
    count.set(2);

    expect(log).toEqual([1, 2]);
  });
});

describe("readme / Computed", () => {
  test("derives value from sources and recomputes when they change", async () => {
    const price = new Value(10);
    const quantity = new Value(3);

    const total = new Computed(() => price.get() * quantity.get());
    expect(total.get()).toBe(30);

    price.set(20);
    quantity.set(2);

    // Recompute is deferred to next tick.
    expect(total.get()).toBe(30);

    await vi.runAllTimersAsync();

    expect(total.get()).toBe(40);
  });
});

describe("readme / Signal.track", () => {
  test("returns the computed result and the set of signals that were read", () => {
    const a = new Value(5);
    const b = new Value(10);

    const [result, usedSignals] = Signal.track(() => a.get() + b.get());

    expect(result).toBe(15);
    expect(usedSignals.has(a)).toBe(true);
    expect(usedSignals.has(b)).toBe(true);
  });
});

describe("readme / Signal.watchFirst", () => {
  test("fires once then stops listening", async () => {
    const status = new Value("idle");
    const onChange = vi.fn();

    Signal.watchFirst(() => status.get(), onChange);

    status.set("loading");
    await vi.runAllTimersAsync();

    status.set("done");
    await vi.runAllTimersAsync();

    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe("readme / Signal.watch", () => {
  test("returns the initial value, reacts to changes, and stops after abort", async () => {
    const name = new Value("Alice");
    const log: string[] = [];

    const [initialValue, controller] = Signal.watch(
      () => name.get().toUpperCase(),
      (next) => log.push(next),
    );

    expect(initialValue).toBe("ALICE");

    name.set("Bob");
    await vi.runAllTimersAsync();

    name.set("Carol");
    await vi.runAllTimersAsync();

    controller.abort();

    name.set("Dave");
    await vi.runAllTimersAsync();

    expect(log).toEqual(["BOB", "CAROL"]);
  });
});

describe("readme / Input", () => {
  test("parses raw string input using NumberConverter", () => {
    const page = new Input(1, new NumberConverter());

    page.set("5");

    expect(page.get()).toBe(5);
  });

  test("uses BooleanConverter by default when initial value is boolean", () => {
    const flag = new Input(false);

    flag.set("yes");

    expect(flag.get()).toBe(true);
  });

  test("custom converter is used for parse and stringify", () => {
    const converter: Converter<number> = {
      parse: (value) => Number(value) * 100,
      stringify: (value) => `${value}%`,
    };

    const progress = new Input(0, converter);

    progress.set("0.5");

    expect(progress.get()).toBe(50);
    expect(progress.toString()).toBe("50%");
  });
});

describe("readme / StringConverter", () => {
  test("converts a number to its string representation", () => {
    const input = new Input("", new StringConverter());

    input.set(42);

    expect(input.get()).toBe("42");
  });
});

describe("readme / NumberConverter", () => {
  test("parses a numeric string to a number", () => {
    const input = new Input(0, new NumberConverter());

    input.set("3.14");

    expect(input.get()).toBe(3.14);
  });
});

describe("readme / BooleanConverter", () => {
  test("parses 'yes' to true and stringifies back to 'yes'", () => {
    const input = new Input(false, new BooleanConverter());

    input.set("yes");

    expect(input.get()).toBe(true);
    expect(input.toString()).toBe("yes");
  });
});

describe("readme / ObjectConverter", () => {
  test("parses a JSON string to an object", () => {
    const input = new Input({}, new ObjectConverter());

    input.set('{"user":"pxstorm"}');

    expect(input.get()).toEqual({ user: "pxstorm" });
  });
});

describe("readme / EnumConverter", () => {
  enum Direction {
    Up,
    Down,
    Left,
    Right,
  }

  test("parses enum key and numeric string to enum members", () => {
    const dir = new Input(Direction.Up, new EnumConverter(Direction));

    dir.set("Down");
    expect(dir.get()).toBe(Direction.Down);

    dir.set("2");

    expect(dir.get()).toBe(Direction.Left);
  });
});
