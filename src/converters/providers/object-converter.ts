import { Converter } from "../converter";

export class ObjectConverter implements Converter<object> {
  public parse(value: unknown): object {
    if (typeof value === "object" && value !== null) {
      return value;
    }

    if(typeof value === "string") {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    }

    throw new Error(`Cannot convert "${value}" to an object.`);
  }

  public stringify(value: object): string {
    return JSON.stringify(value);
  }
}