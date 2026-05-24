import { Converter } from "../converter";

export class StringConverter implements Converter<string> {
  public parse(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    if (value == null || value === undefined) {
      return "";
    }

    return value.toString();
  }

  public stringify(value: string): string {
    return value;
  }
}