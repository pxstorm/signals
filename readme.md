# @pxstorm/signals

A lightweight, reactive signals library for TypeScript. Build reactive state with values, computed signals, and flexible watchers.

---

## Installation

> _Coming soon._

---

## Getting Started

### Value

A `Value` is the basic unit of reactive state. It holds a typed value and notifies subscribers when it changes.

```ts
import { Value } from "@pxstorm/signals";

const count = new Value(0);

count.subscribe((next) => {
  console.log("count changed:", next);
});

count.set(1); // logs: count changed: 1
count.set(1); // no notification — value unchanged
count.set(2); // logs: count changed: 2
```

- `get()` returns the current value.
- `set(value)` updates the value and notifies subscribers only when the value actually changed (by reference for objects).
- `subscribe(fn)` registers a listener called with the new value on every change.
- `unsubscribe(fn)` unregister a listener (fail if listener is not registered).
- `tryUnsubscribe(fn)` unregister a listener (continue if listener is not registered).
- `toString()` returns a string representation of the current value.

---

### Computed

A `Computed` derives its value from other signals. It automatically tracks its dependencies and re-evaluates lazily on next tick when any dependency changes.

```ts
import { Value, Computed } from "@pxstorm/signals";

const price = new Value(10);
const quantity = new Value(3);

const total = new Computed(() => price.get() * quantity.get());

console.log(total.get()); // 30

price.set(20);
quantity.set(2);

// Computed wait until next tick to recompute,
// that allows computed to aggregate all signal changes.
console.log(total.get()); // 30

setTimeout(() => console.log(total.get()); // 40
```

- The computation function is called once on construction and again whenever a tracked dependency changes.
- When multiple dependencies change in the same tick, `Computed` recomputes only once.
- `recompute()` forces an immediate synchronous re-evaluation.

---

### Signal.track / Signal.watch

`Signal` provides utilities for tracking which signals are read inside a function and reacting to their changes.

#### `Signal.track`

Runs a function and returns its result alongside the set of signals that were read.

```ts
import { Value, Signal } from "@pxstorm/signals";

const a = new Value(5);
const b = new Value(10);
const c = new Value(15);

const [result, usedSignals] = Signal.track(() => a.get() + b.get());

console.log(result);            // 15
console.log(usedSignals.has(a)); // true
console.log(usedSignals.has(b)); // true
console.log(usedSignals.has(c)); // false
```

#### `Signal.watchFirst`

Watches a reactive expression and calls `onChange` on next tick once the first tracked signal change. After the first change the subscription is automatically cleaned up.

```ts
import { Value, Signal } from "@pxstorm/signals";

const status = new Value("idle");

Signal.watchFirst(() => status.get(), () => {
  console.log("status changed");
});

status.set("loading"); 
waitToNextTick(); // logs: status changed

status.set("done");
waitToNextTick(); // no longer listening
```

#### `Signal.watch`

Continuously watches a reactive expression and calls `onChange` with the new value on next tick every time a tracked signal changes. Returns an `AbortController` to stop watching.

```ts
import { Value, Signal } from "@pxstorm/signals";

const name = new Value("Alice");

const [initialValue, controller] = Signal.watch(
  () => name.get().toUpperCase(),
  (next) => console.log("name:", next)
);

console.log(initialValue); // "ALICE"

name.set("Bob");  
waitToNextTick(); // logs: name: BOB

name.set("Carol"); 
waitToNextTick(); // logs: name: CAROL

controller.abort(); // stop watching

name.set("Dave"); // no longer triggers
```

---

## API

### Input

`Input` is a `Value` that accepts raw, untyped input and converts it to a typed value via a `Converter`. It is useful when receiving values from external sources such as URL parameters, form fields, or query strings.

```ts
import { Input, NumberConverter } from "@pxstorm/signals";

const page = new Input(1, new NumberConverter());

page.set("5");         // parses "5" → 5
console.log(page.get()); // 5
```

When no converter is provided, `Input` automatically selects a default one based on the type of the initial value (`string`, `number`, `boolean`, or `object`).

```ts
const flag = new Input(false); // uses BooleanConverter by default
flag.set("yes");
console.log(flag.get()); // true
```

`toString()` uses the converter's `stringify` to produce the external representation.

---

### Converters

Converters implement the `Converter<T>` interface with two methods:

| Method | Description |
|---|---|
| `parse(value)` | Converts an unknown raw value to type `T` |
| `stringify(value)` | Converts a `T` back to a string |

You can provide a custom converter to `Input`:

```ts
import { Input, Converter } from "@pxstorm/signals";

const converter: Converter<number> = {
  parse: (value) => Number(value) * 100,
  stringify: (value) => `${value}%`,
};

const progress = new Input(0, converter);
progress.set("0.5");
console.log(progress.get());      // 50
console.log(progress.toString()); // "50%"
```

#### Built-in Converters

**`StringConverter`**

Converts any value to a string. Returns an empty string for `null` / `undefined`. Objects are converted via their `.toString()` method.

```ts
const input = new Input("", new StringConverter());
input.set(42);
console.log(input.get()); // "42"
```

---

**`NumberConverter`**

Parses numeric strings and number values. Throws for non-numeric strings, booleans, `null`, `undefined`, and `Infinity`.

```ts
const input = new Input(0, new NumberConverter());
input.set("3.14");
console.log(input.get()); // 3.14
```

---

**`BooleanConverter`**

Recognises truthy strings (`"true"`, `"yes"`, `"on"`) and falsy strings (`"false"`, `"no"`, `"off"`) case-insensitively. Numeric `1` maps to `true`, `0` to `false`. `stringify` mirrors the synonym last parsed.

```ts
const input = new Input(false, new BooleanConverter());
input.set("yes");
console.log(input.get());      // true
console.log(input.toString()); // "yes"
```

---

**`ObjectConverter`**

Parses JSON strings into objects/arrays and passes through existing object/array values unchanged. `stringify` serialises the value as JSON.

```ts
const input = new Input({}, new ObjectConverter());
input.set('{"user":"pxstorm"}');
console.log(input.get()); // { user: "pxstorm" }
```

---

**`EnumConverter`**

Maps enum keys and values to enum members. Works with both numeric and string enums. Throws when the value is not a valid member.

```ts
import { Input, EnumConverter } from "@pxstorm/signals";

enum Direction { Up, Down, Left, Right }
const dir = new Input(Direction.Up, new EnumConverter(Direction));

dir.set("Down");
console.log(dir.get()); // Direction.Down (1)

dir.set("2");
console.log(dir.get()); // Direction.Left (2)
```

`stringify` returns the enum key for numeric enums and the enum value for string enums.
