# Core Syntax Overview

A quick-reference guide to the most important syntax and operators in the beginner web stack: JavaScript, CSS, and Git/bash. Use this to look up what a symbol means, see an example, and understand when to use it. For deeper learning, see the main modules (links at the end of each section).

---

## JavaScript: Core Syntax & Operators

### Assignment & Comparison Operators

| Symbol | Name               | Example    | What it does                            | When/Why to use                             |
| ------ | ------------------ | ---------- | --------------------------------------- | ------------------------------------------- |
| =      | Assignment         | let x = 5; | Assigns value to variable               | Always for assignment                       |
| +=     | Add & assign       | x += 2     | x = x + 2                               | Shorter update                              |
| -=     | Subtract & assign  | x -= 2     | x = x - 2                               | Shorter update                              |
| \*=    | Multiply & assign  | x \*= 2    | x = x \* 2                              | Shorter update                              |
| /=     | Divide & assign    | x /= 2     | x = x / 2                               | Shorter update                              |
| %=     | Modulus & assign   | x %= 2     | x = x % 2                               | Shorter update                              |
| \*\*=  | Exponent & assign  | x \*\*= 2  | x = x \*\* 2                            | Shorter update                              |
| ==     | Equality (loose)   | x == '5'   | True if values are equal (type-coerced) | Rarely; can cause bugs due to type coercion |
| ===    | Equality (strict)  | x === 5    | True if value and type are equal        | Preferred for comparisons                   |
| !=     | Not equal (loose)  | x != '5'   | True if values are not equal            | Rarely; see above                           |
| !==    | Not equal (strict) | x !== 5    | True if value or type not equal         | Preferred for comparisons                   |
| >      | Greater than       | x > 3      | True if x is greater than 3             | Numeric/string comparisons                  |
| <      | Less than          | x < 10     | True if x is less than 10               | Numeric/string comparisons                  |
| >=     | Greater or equal   | x >= 5     | True if x is 5 or more                  | Numeric/string comparisons                  |
| <=     | Less or equal      | x <= 5     | True if x is 5 or less                  | Numeric/string comparisons                  |

### Logical & Nullish Operators

| Symbol | Name    | Example  | What it does                            | When/Why to use                 |
| ------ | ------- | -------- | --------------------------------------- | ------------------------------- |
| &&     | AND     | a && b   | True if both a and b are true           | Combine conditions              |
| \|\|   | OR      | a \|\| b | True if either a or b is true           | Fallback/default value          |
| !      | NOT     | !a       | True if a is false                      | Invert a boolean                |
| ??     | Nullish | a ?? b   | Returns a if not null/undefined, else b | Default only for null/undefined |

**Example:**

```js
let name = userInput || "Guest"; // fallback if falsy (0, '', null, undefined)
let safe = userInput ?? "Guest"; // fallback only if null or undefined
```

### Arithmetic Operators

| Symbol | Name        | Example  | What it does                  | When/Why to use            |
| ------ | ----------- | -------- | ----------------------------- | -------------------------- |
| +      | Addition    | a + b    | Adds numbers or joins strings | Math, string concatenation |
| -      | Subtraction | a - b    | Subtracts b from a            | Math                       |
| \*     | Multiply    | a \* b   | Multiplies a and b            | Math                       |
| /      | Divide      | a / b    | Divides a by b                | Math                       |
| %      | Modulus     | a % b    | Remainder of a divided by b   | Even/odd checks, cycles    |
| \*\*   | Exponent    | a \*\* b | a to the power of b           | Powers                     |
| ++     | Increment   | x++      | Adds 1 to x                   | Loops, counters            |
| --     | Decrement   | x--      | Subtracts 1 from x            | Loops, counters            |

### Bitwise Operators

| Symbol | Name                 | Example | What it does                    |
| ------ | -------------------- | ------- | ------------------------------- | --- | ---------- |
| &      | AND                  | a & b   | Bitwise AND                     |
|        |                      | OR      | a                               | b   | Bitwise OR |
| ^      | XOR                  | a ^ b   | Bitwise exclusive OR            |
| ~      | NOT                  | ~a      | Bitwise NOT (inverts bits)      |
| <<     | Left shift           | a << 2  | Shifts bits left                |
| >>     | Right shift          | a >> 2  | Shifts bits right               |
| >>>    | Unsigned right shift | a >>> 2 | Shifts bits right, fills with 0 |

**Example:**

```js
let mask = 0b1100;
let result = mask & 0b1010; // 0b1000
```

### Other Operators & Syntax

| Symbol     | Name/Use           | Example            | What it does/When to use              |
| ---------- | ------------------ | ------------------ | ------------------------------------- |
| ?.         | Optional chaining  | obj?.prop          | Access prop if obj not null/undefined |
| []         | Property access    | obj['key']         | Access property by string             |
| .          | Property access    | obj.key            | Access property by name               |
| typeof     | Type check         | typeof x           | Returns type as string                |
| instanceof | Instance check     | x instanceof Array | True if x is instance of Array        |
| in         | Property in object | 'key' in obj       | True if obj has property 'key'        |
| delete     | Delete property    | delete obj.key     | Removes property from object          |
| new        | Constructor        | new Date()         | Creates new instance                  |
| ...        | Spread/rest        | [...arr], ...args  | Expand/collect values                 |
| ,          | Comma              | a = (1,2,3)        | Evaluates all, returns last           |
| void       | void operator      | void 0             | Returns undefined                     |
| yield      | Generator yield    | yield value        | Pauses generator, returns value       |
| await      | Await promise      | await fetch(url)   | Waits for promise to resolve          |

**Examples:**

```js
let value = obj?.nested?.prop; // Safe access
let arr2 = [...arr1, 4]; // Spread
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
} // Rest
if ("name" in obj) {
  /* property exists */
}
if (arr instanceof Array) {
  /* is array */
}
```

### Ternary Operator

| Symbol | Name    | Example   | What it does                    | When/Why to use |
| ------ | ------- | --------- | ------------------------------- | --------------- |
| ? :    | Ternary | a ? b : c | If a is true, returns b, else c | Short if-else   |

**Example:**

```js
let status = age >= 18 ? "Adult" : "Minor";
```

### Control Flow

- **if/else:**
  ```js
  if (x > 0) { ... } else { ... }
  ```
- **switch:**
  ```js
  switch(day) {
    case 'Mon': ...; break;
    default: ...;
  }
  ```
- **for loop:**
  ```js
  for (let i = 0; i < 5; i++) { ... }
  ```
- **while loop:**
  ```js
  while (condition) { ... }
  ```
- **do...while:**
  ```js
  do { ... } while (condition);
  ```
- **break/continue:**
  ```js
  for (let x of arr) { if (x === 0) break; if (x < 0) continue; ... }
  ```
- **return:**
  ```js
  function add(a, b) {
    return a + b;
  }
  ```

### Function Syntax

- **Function declaration:**
  ```js
  function greet(name) {
    return `Hello, ${name}`;
  }
  ```
- **Function expression:**
  ```js
  const greet = function (name) {
    return `Hello, ${name}`;
  };
  ```
- **Arrow function:**
  ```js
  const add = (a, b) => a + b;
  ```
- **Immediately Invoked Function Expression (IIFE):**
  ```js
  (function () {
    /* runs immediately */
  })();
  ```

### Object & Array Syntax

- **Property access:**
  ```js
  obj.key;
  obj["key"];
  ```
- **Shorthand property:**
  ```js
  let x = 1;
  let obj = { x };
  ```
- **Computed property:**
  ```js
  let key = "age";
  let obj = { [key]: 42 };
  ```
- **Method syntax:**
  ```js
  let obj = {
    greet() {
      return "hi";
    },
  };
  ```
- **Array methods:**
  ```js
  arr.map((x) => x * 2);
  arr.filter((x) => x > 0);
  arr.reduce((a, b) => a + b, 0);
  ```

### Error Handling

- **try/catch/finally:**
  ```js
  try {
    risky();
  } catch (e) {
    console.error(e);
  } finally {
    cleanup();
  }
  ```
- **throw:**
  ```js
  throw new Error("Something went wrong");
  ```

### Async/Await

- **async**: Declares a function as asynchronous, so it always returns a promise.
- **await**: Pauses the function execution until the promise resolves, then returns the result.

**Example:**

```js
async function fetchUser() {
  try {
    const response = await fetch("https://api.example.com/user");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
}
```

- Use `async`/`await` to write asynchronous code that looks synchronous and is easier to read than using `.then()`/`.catch()`.
- See also the `await` operator in the table above.

### ES6+ Features

- **let/const/var:**
  ```js
  let x = 1; // block-scoped, re-assignable
  const y = 2; // block-scoped, not re-assignable
  var z = 3; // function-scoped, legacy
  ```
- **import/export:**
  ```js
  // In module.js
  export function add(a, b) {
    return a + b;
  }
  // In main.js
  import { add } from "./module.js";
  ```

### Other Useful Syntax

- **Template literals:** `` `Hello, ${name}!` `` (string interpolation)
- **Destructuring:** `const [a, b] = arr;` or `const {x, y} = obj;`
- **Spread/rest:** `const arr2 = [...arr1, 4]`, `function(...args)`

**See [Module 0.2](./Module-0.2-HTML-Fundamentals.md) and [Phase 1] for more JavaScript.**

---

## CSS: Selectors, Combinators & Units

### Selectors & Combinators

| Symbol | Name            | Example            | What it selects                    | When/Why to use            |
| ------ | --------------- | ------------------ | ---------------------------------- | -------------------------- |
| .      | Class selector  | .card              | All elements with class="card"     | Style groups of elements   |
| #      | ID selector     | #main              | Element with id="main"             | Unique element             |
| \*     | Universal       | \*                 | All elements                       | Reset or global styles     |
| >      | Child           | .list > li         | Direct children only               | Structure-specific styling |
|        | Descendant      | .list li           | All li inside .list (any depth)    | Nested styling             |
| +      | Adjacent        | h2 + p             | p immediately after h2             | Sibling styling            |
| ~      | General sibling | h2 ~ p             | All p after h2 (same parent)       | Sibling styling            |
| [ ]    | Attribute       | input[type="text"] | Elements with attribute            | Target by attribute        |
| :      | Pseudo-class    | a:hover            | State (hover, active, etc.)        | Interactivity              |
| ::     | Pseudo-element  | p::first-line      | Part of element (first line, etc.) | Fine-grained styling       |

**Example:**

```css
.card > img {
  border-radius: 8px;
}
a:hover {
  color: red;
}
```

### Units

| Unit | Example | What it means              |
| ---- | ------- | -------------------------- |
| px   | 16px    | Pixels (fixed size)        |
| %    | 50%     | Percentage of parent       |
| em   | 2em     | Relative to font size      |
| rem  | 1.5rem  | Relative to root font size |
| fr   | 1fr     | Fraction of grid container |
| vw   | 50vw    | % of viewport width        |
| vh   | 50vh    | % of viewport height       |

**See [Module 0.3](./Module-0.3-CSS-Fundamentals.md) for more.**

---

## Git/Bash: Operators & Syntax

### Chaining & Pipes

| Symbol | Name      | Example                 | What it does                          | When/Why to use             |
| ------ | --------- | ----------------------- | ------------------------------------- | --------------------------- | ------------------------------ | ---------------------- |
| &&     | AND chain | git add . && git commit | Runs second command if first succeeds | Ensure order, stop on error |
| ;      | Sequence  | cmd1 ; cmd2             | Runs both, regardless of success      | Always run both             |
|        |           | Pipe                    | ls                                    | grep txt                    | Passes output of left to right | Filter, process output |

### Redirection & Wildcards

| Symbol | Name     | Example             | What it does                       | When/Why to use           |
| ------ | -------- | ------------------- | ---------------------------------- | ------------------------- |
| >      | Redirect | echo hi > file.txt  | Overwrites file with output        | Save/replace output       |
| >>     | Append   | echo hi >> file.txt | Appends output to file             | Add to file               |
| \*     | Wildcard | git add \*.js       | Matches any file ending .js        | Batch operations          |
| ?      | Wildcard | file?.txt           | Matches file1.txt, file2.txt, etc. | Single-character wildcard |

**Example:**

```bash
git status && git add . && git commit -m "Update"
ls *.md | sort > sorted-list.txt
```

**See [Module 0.4](./Module-0.4-Version-Control-Git-GitHub.md) for more.**

---

## Other Syntax

### Markdown

| Symbol | Name        | Example   | What it does          |
| ------ | ----------- | --------- | --------------------- |
| #      | Heading     | # Title   | Large heading         |
| \*     | List/item   | \* Item   | Bullet list           |
| -      | List/item   | - Item    | Bullet list           |
| `      | Inline code | `code`    | Inline code           |
| ```    | Code block  | `js ... ` | Multi-line code block |

### JSON

- Objects: `{ "key": "value" }`
- Arrays: `[1, 2, 3]`
- Key-value pairs, commas between items

### Terminal Basics

- `cd folder` – Change directory
- `ls` – List files
- `mkdir newfolder` – Make new folder

---

## Cross-References

- [Module 0.1: Development Environment Setup](./Module-0.1-Development-Environment-Setup.md)
- [Module 0.2: HTML Fundamentals](./Module-0.2-HTML-Fundamentals.md)
- [Module 0.3: CSS Fundamentals](./Module-0.3-CSS-Fundamentals.md)
- [Module 0.4: Version Control with Git and GitHub](./Module-0.4-Version-Control-Git-GitHub.md)

For more details and practice, see the relevant module above. This file is a quick reference—use it to look up syntax and operators as you code!
