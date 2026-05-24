import { describe, expect, test } from "vitest";
import { BooleanConverter } from "../../index";

describe("parse", () => {
  test("returns boolean inputs unchanged", () => {
    const converter = new BooleanConverter();

    expect(converter.parse(true)).toBe(true);
    expect(converter.parse(false)).toBe(false);
  });

  test("parses numeric inputs", () => {
    const converter = new BooleanConverter();

    expect(converter.parse(1)).toBe(true);
    expect(converter.parse(0)).toBe(false);
    expect(converter.parse(-1)).toBe(false);
  });

  test("parses known string true values case-insensitively", () => {
    const converter = new BooleanConverter();

    expect(converter.parse("TRUE")).toBe(true);
    expect(converter.parse("Yes")).toBe(true);
    expect(converter.parse("on")).toBe(true);
  });

  test("parses known string false values case-insensitively", () => {
    const converter = new BooleanConverter();

    expect(converter.parse("FALSE")).toBe(false);
    expect(converter.parse("No")).toBe(false);
    expect(converter.parse("off")).toBe(false);
  });

  test("throws for unsupported values", () => {
    const converter = new BooleanConverter();

    expect(() => converter.parse(2)).toThrow('Cannot convert "2" to a boolean.');
    expect(() => converter.parse("maybe")).toThrow('Cannot convert "maybe" to a boolean.');
    expect(() => converter.parse(null)).toThrow('Cannot convert "null" to a boolean.');
  });
});

describe("stringify", () => {
  test("uses default string values when parse was not called", () => {
    const converter = new BooleanConverter();

    expect(converter.stringify(true)).toBe("true");
    expect(converter.stringify(false)).toBe("false");
  });

  test("uses the same synonym index captured by parse", () => {
    const converter = new BooleanConverter();

    converter.parse("yes");
    expect(converter.stringify(true)).toBe("yes");
    expect(converter.stringify(false)).toBe("no");

    converter.parse("off");
    expect(converter.stringify(true)).toBe("on");
    expect(converter.stringify(false)).toBe("off");
  });
});