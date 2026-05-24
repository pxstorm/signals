import { Converter } from "../converters/converter";
import { Signal } from "./signal";

/**
 * A simple signal that holds a value and allows subscribers to be notified of changes.
 */
export class Value<T> extends Signal<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }

  /**
   * Set a new value and notify subscribers of the change.
   *
   * @param newValue
   */
  public set(newValue: T): void {
    if (newValue !== this.value) {
      this.value = newValue;
      this.valueChanged();
    }
  }
}