import { describe, expect, test } from "vitest";
import { StringConverter } from "../../index";

describe("parse", () => {
  test("returns string inputs unchanged", () => {
    const converter = new StringConverter();

    expect(converter.parse("hello")).toBe("hello");
    expect(converter.parse("")).toBe("");
  });

  test("returns empty string for nullish inputs", () => {
    const converter = new StringConverter();

    expect(converter.parse(null)).toBe("");
    expect(converter.parse(undefined)).toBe("");
  });

  test("converts primitive non-string values using toString", () => {
    const converter = new StringConverter();

    expect(converter.parse(42)).toBe("42");
    expect(converter.parse(true)).toBe("true");
    expect(converter.parse(false)).toBe("false");
  });

  test("converts objects using their toString result", () => {
    const converter = new StringConverter();

    expect(converter.parse({ a: 1 })).toBe("[object Object]");
    expect(converter.parse([1, 2, 3])).toBe("1,2,3");
  });
});

describe("stringify", () => {
  test("returns string values unchanged", () => {
    const converter = new StringConverter();

    expect(converter.stringify("alpha")).toBe("alpha");
    expect(converter.stringify("")).toBe("");
  });
});