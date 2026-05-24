import { describe, expect, test } from "vitest";
import { EnumConverter } from "../../index";

enum NumericStatus {
  Pending,
  Done,
}

enum StringStatus {
  Pending = "PENDING",
  Done = "DONE",
}

describe("parse", () => {
  test("parses numeric enum by key name", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(converter.parse("Pending")).toBe(NumericStatus.Pending);
    expect(converter.parse("Done")).toBe(NumericStatus.Done);
  });

  test("parses numeric enum by numeric value", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(converter.parse(NumericStatus.Pending)).toBe(NumericStatus.Pending);
    expect(converter.parse(NumericStatus.Done)).toBe(NumericStatus.Done);
  });

  test("parses numeric enum by numeric string", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(converter.parse("0")).toBe(NumericStatus.Pending);
    expect(converter.parse(1)).toBe(NumericStatus.Done);
  });

  test("parses string enum by key and by value", () => {
    const converter = new EnumConverter<StringStatus>(StringStatus);

    expect(converter.parse("Pending")).toBe(StringStatus.Pending);
    expect(converter.parse("DONE")).toBe(StringStatus.Done);
  });

  test("throws when value is not part of the enum", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(() => converter.parse("Unknown")).toThrow('Cannot convert "Unknown" to enum.');
    expect(() => converter.parse(99)).toThrow('Cannot convert "99" to enum.');
  });
});

describe("stringify", () => {
  test("stringifies numeric enum value to enum key", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(converter.stringify(NumericStatus.Pending)).toBe("Pending");
    expect(converter.stringify(NumericStatus.Done)).toBe("Done");
  });

  test("stringifies string enum value to enum value", () => {
    const converter = new EnumConverter<StringStatus>(StringStatus);

    expect(converter.stringify(StringStatus.Pending)).toBe("PENDING");
    expect(converter.stringify(StringStatus.Done)).toBe("DONE");
  });

  test("throws when stringifying a value outside the enum", () => {
    const converter = new EnumConverter<NumericStatus>(NumericStatus);

    expect(() => converter.stringify(99 as NumericStatus)).toThrow(
      "Cannot stringify enum value: 99",
    );
  });
});