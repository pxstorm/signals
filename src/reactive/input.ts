import { Converter } from "../converters/converter";
import { BooleanConverter } from "../converters/providers/boolean-converter";
import { NumberConverter } from "../converters/providers/number-converter";
import { ObjectConverter } from "../converters/providers/object-converter";
import { StringConverter } from "../converters/providers/string-converter";
import { Signal } from "./signal";

/**
 * A simple signal that holds a value and allows subscribers to be notified of changes.
 */
export class Input<T = string> extends Signal<T> {
  private readonly converter: Converter<T>;

  constructor(initialValue: T, converter?: Converter<T>) {
    super(initialValue);
    this.converter = converter ?? this.initializeDefaultConverter(initialValue);
  }

  /**
   * Initialize the default converter based on the type of T.
   */
  private initializeDefaultConverter(initialValue: T): Converter<T> {
    if (typeof initialValue === "string") {
      return new StringConverter() as Converter<T>;
    } else if (typeof initialValue === "number") {
      return new NumberConverter() as Converter<T>;
    } else if (typeof initialValue === "boolean") {
      return new BooleanConverter() as Converter<T>;
    } else if (typeof initialValue === "object" && initialValue !== null) {
      return new ObjectConverter() as Converter<T>;
    } else {
      throw new Error("No default converter available for the specified type. Please provide a custom converter.");
    }
  }

  /**
   * Set a new value and notify subscribers of the change.
   *
   * @param newValue
   */
  public set(newValue: unknown): void {
    const parsedNewValue = this.converter.parse(newValue);
    if (parsedNewValue !== this.value) {
      this.value = parsedNewValue;
      this.valueChanged();
    }
  }

  /**
   * Convert the signal's value to a string representation.
   *
   * @returns JSON string representation of the current value.
   */
  public override toString(): string {
    const value = this.get();
    return this.converter.stringify(value);
  }
}