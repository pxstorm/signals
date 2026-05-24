import { Converter } from "../converter";

export class NumberConverter implements Converter<number> {
  public parse(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const trimmed = value.trim();
      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed;
      }
    }

    throw new Error(`Cannot convert "${value}" to a number.`);
  }

  public stringify(value: number): string {
    return value.toString();
  }
}