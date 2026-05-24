import { describe, expect, test } from "vitest";
import { NumberConverter } from "../../index";

describe("parse", () => {
  test("returns number inputs unchanged", () => {
    const converter = new NumberConverter();

    expect(converter.parse(0)).toBe(0);
    expect(converter.parse(-12.5)).toBe(-12.5);
  });

  test("throws for Infinity and -Infinity numeric inputs", () => {
    const converter = new NumberConverter();

    expect(() => converter.parse(Infinity)).toThrow('Cannot convert "Infinity" to a number.');
    expect(() => converter.parse(-Infinity)).toThrow('Cannot convert "-Infinity" to a number.');
  });

  test("parses numeric strings", () => {
    const converter = new NumberConverter();

    expect(converter.parse("42")).toBe(42);
    expect(converter.parse("3.14")).toBe(3.14);
    expect(converter.parse("-7.5")).toBe(-7.5);
  });

  test("parses strict numeric strings", () => {
    const converter = new NumberConverter();

    expect(converter.parse("  10.5  ")).toBe(10.5);
    expect(converter.parse("1e3")).toBe(1000);
  });

  test("throws for unsupported values", () => {
    const converter = new NumberConverter();

    expect(() => converter.parse("abc")).toThrow('Cannot convert "abc" to a number.');
    expect(() => converter.parse("12abc")).toThrow('Cannot convert "12abc" to a number.');
    expect(() => converter.parse("Infinity")).toThrow('Cannot convert "Infinity" to a number.');
    expect(() => converter.parse("-Infinity")).toThrow('Cannot convert "-Infinity" to a number.');
    expect(() => converter.parse(true)).toThrow('Cannot convert "true" to a number.');
    expect(() => converter.parse(null)).toThrow('Cannot convert "null" to a number.');
    expect(() => converter.parse(undefined)).toThrow('Cannot convert "undefined" to a number.');
  });
});

describe("stringify", () => {
  test("stringifies integer and float values", () => {
    const converter = new NumberConverter();

    expect(converter.stringify(42)).toBe("42");
    expect(converter.stringify(3.14)).toBe("3.14");
    expect(converter.stringify(-7.5)).toBe("-7.5");
  });
});