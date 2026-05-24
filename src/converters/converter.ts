export interface Converter<T> {
  parse(value: unknown): T;
  stringify(value: T): string;
}