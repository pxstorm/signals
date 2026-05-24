import { Converter } from "../converter";

export class BooleanConverter implements Converter<boolean> {
  public static readonly trueValues = ["true", "1", "yes", "y", "on"];
  public static readonly falseValues = ["false", "0", "no", "n", "off"];

  /**
   * Tracks the index of the last used true/false string value for consistent stringify output.
   */
  private usedValueIndex?: number;

  public parse(value: unknown): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    if(typeof value === "number") {
      if(value === 1) {
        return true;
      } else if(value === 0 || value === -1) {
        return false;
      }
    }

    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      if (BooleanConverter.trueValues.includes(lowerValue)) {
        this.usedValueIndex = BooleanConverter.trueValues.indexOf(lowerValue);
        return true;
      } else if (BooleanConverter.falseValues.includes(lowerValue)) {
        this.usedValueIndex = BooleanConverter.falseValues.indexOf(lowerValue);
        return false;
      }
    }

    throw new Error(`Cannot convert "${value}" to a boolean.`);
  }

  public stringify(value: boolean): string {
    const valueIndex = this.usedValueIndex ?? 0;

    return value
      ? BooleanConverter.trueValues[valueIndex]
      : BooleanConverter.falseValues[valueIndex];
  }
}