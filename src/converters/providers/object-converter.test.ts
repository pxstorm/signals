import { describe, expect, test } from "vitest";
import { ObjectConverter } from "../../index";

describe("parse", () => {
  test("returns object inputs unchanged", () => {
    const converter = new ObjectConverter();
    const value = { id: 1, label: "alpha" };

    expect(converter.parse(value)).toBe(value);
  });

  test("returns array inputs unchanged", () => {
    const converter = new ObjectConverter();
    const value = [1, 2, 3];

    expect(converter.parse(value)).toBe(value);
  });

  test("parses valid object JSON strings", () => {
    const converter = new ObjectConverter();

    expect(converter.parse('{"id":1,"label":"alpha"}')).toEqual({
      id: 1,
      label: "alpha",
    });
  });

  test("parses valid array JSON strings", () => {
    const converter = new ObjectConverter();

    expect(converter.parse("[1,2,3]")).toEqual([1, 2, 3]);
  });

  test("throws for JSON strings that do not produce an object", () => {
    const converter = new ObjectConverter();

    expect(() => converter.parse("123")).toThrow('Cannot convert "123" to an object.');
    expect(() => converter.parse("true")).toThrow('Cannot convert "true" to an object.');
    expect(() => converter.parse("null")).toThrow('Cannot convert "null" to an object.');
  });

  test("throws for unsupported non-string primitives", () => {
    const converter = new ObjectConverter();

    expect(() => converter.parse(123)).toThrow('Cannot convert "123" to an object.');
    expect(() => converter.parse(true)).toThrow('Cannot convert "true" to an object.');
    expect(() => converter.parse(null)).toThrow('Cannot convert "null" to an object.');
    expect(() => converter.parse(undefined)).toThrow('Cannot convert "undefined" to an object.');
  });

  test("throws for invalid JSON strings", () => {
    const converter = new ObjectConverter();

    expect(() => converter.parse("{invalid-json}")).toThrow();
  });
});

describe("stringify", () => {
  test("stringifies objects and arrays", () => {
    const converter = new ObjectConverter();

    expect(converter.stringify({ id: 1, label: "alpha" })).toBe('{"id":1,"label":"alpha"}');
    expect(converter.stringify([1, 2, 3])).toBe("[1,2,3]");
  });
});