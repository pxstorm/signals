import { Converter } from "../converter";

/**
 * A generic enum converter for mapping, parsing, and stringifying enum values.
 * Usage: new EnumConverter(MyEnum)
 */
export class EnumConverter<T> implements Converter<T> {
	private readonly enumObj: any;

	constructor(enumObj: any) {
		this.enumObj = enumObj;
	}

	public parse(value: unknown): T {
		if (typeof value === "number") {
			if (value in this.enumObj) {
				return value as T;
			}
		}

		if (typeof value === "string") {
			// Try direct key match
			if (value in this.enumObj) {
				const matchedValue = this.enumObj[value];

				// Handle numeric-enum numeric-string keys (e.g., "0", "1").
				const numericKey = Number(value);
				if (
					Number.isInteger(numericKey) &&
					String(numericKey) === value &&
					numericKey in this.enumObj
				) {
					return numericKey as T;
				}

				return matchedValue as T;
			}

			// Try value match (for string enums)
			for (const key in this.enumObj) {
				if (this.enumObj[key] === value) {
					return this.enumObj[key] as T;
				}
			}
		}

		throw new Error(`Cannot convert "${value}" to enum.`);
	}

	public stringify(value: T): string {
		// For numeric enums, get the key; for string enums, return the value
		for (const key in this.enumObj) {
			if (this.enumObj[key] === value) {
				return typeof value === "number" ? key : value as unknown as string;
			}
		}

		throw new Error(`Cannot stringify enum value: ${value}`);
	}
}
