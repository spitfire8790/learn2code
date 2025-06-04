# Core Syntax Overview

A quick-reference guide to the most important syntax and operators in the beginner web stack: JavaScript, CSS, and Git/bash. Use this to look up what a symbol means, see an example, and understand when to use it. For deeper learning, see the main modules (links at the end of each section).

---

## JavaScript: Core Syntax & Operators

JavaScript is the programming language that brings interactivity to web pages. Understanding its operators and syntax is fundamental to building any web application. This section covers the essential operators you'll use every day as a developer.

### Assignment & Comparison Operators

Assignment operators are how we store and update values in variables. Comparison operators help us make decisions in our code by comparing values.

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

**Why strict comparison matters:** The `===` operator checks both value and type, preventing unexpected bugs. For example, `5 == "5"` returns `true`, but `5 === "5"` returns `false` because one is a number and one is a string.

### Logical & Nullish Operators

Logical operators help us combine conditions and create complex decision-making logic. They're essential for controlling program flow.

| Symbol | Name    | Example  | What it does                            | When/Why to use                 |
| ------ | ------- | -------- | --------------------------------------- | ------------------------------- |
| &&     | AND     | a && b   | True if both a and b are true           | Combine conditions              |
| \|\|   | OR      | a \|\| b | True if either a or b is true           | Fallback/default value          |
| !      | NOT     | !a       | True if a is false                      | Invert a boolean                |
| ??     | Nullish | a ?? b   | Returns a if not null/undefined, else b | Default only for null/undefined |

**Understanding the difference:** The `||` operator treats many values as "falsy" (0, "", false, null, undefined), while `??` only checks for null and undefined. This makes `??` safer for providing defaults when 0 or empty strings are valid values.

**Example:**

```js
// Using || for general fallbacks
let name = userInput || "Guest"; // fallback if falsy (0, '', null, undefined)

// Using ?? for more precise fallbacks
let safe = userInput ?? "Guest"; // fallback only if null or undefined

// Practical example: user settings
let fontSize = userSettings.fontSize ?? 16; // 0 would be a valid font size
let theme = userSettings.theme || "light"; // empty string should fall back to light
```

### Arithmetic Operators

These operators perform mathematical calculations - the building blocks of any computational logic in your applications.

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

**Key insight:** The `+` operator has dual behaviour - it adds numbers but concatenates strings. JavaScript will convert numbers to strings when mixed: `5 + "3"` becomes `"53"`, not `8`.

**Practical examples:**

```js
// Common calculations
let totalPrice = basePrice + tax; // Addition
let discount = originalPrice * 0.1; // 10% discount
let remainingItems = totalItems % itemsPerPage; // Pagination logic
let area = length ** 2; // Square area

// Increment/decrement in loops
for (let i = 0; i < items.length; i++) {
  // i++ increments i after each iteration
}
```

### Bitwise Operators

Bitwise operators work with the binary representation of numbers. While less commonly used in everyday web development, they're useful for performance-critical operations, flags, and certain algorithms.

| Symbol | Name                 | Example | What it does                    |
| ------ | -------------------- | ------- | ------------------------------- |
| &      | AND                  | a & b   | Bitwise AND                     |
| \|     | OR                   | a \| b  | Bitwise OR                      |
| ^      | XOR                  | a ^ b   | Bitwise exclusive OR            |
| ~      | NOT                  | ~a      | Bitwise NOT (inverts bits)      |
| <<     | Left shift           | a << 2  | Shifts bits left                |
| >>     | Right shift          | a >> 2  | Shifts bits right               |
| >>>    | Unsigned right shift | a >>> 2 | Shifts bits right, fills with 0 |

**When you might use bitwise operators:** Permission systems (checking if a user has specific permissions), feature flags, or optimizing mathematical operations.

**Example:**

```js
// Binary representation and bitwise operations
let mask = 0b1100; // Binary: 1100 (decimal 12)
let value = 0b1010; // Binary: 1010 (decimal 10)
let result = mask & value; // Binary: 1000 (decimal 8)

// Real-world example: Permission checking
const PERMISSIONS = {
  READ: 1, // 0001
  WRITE: 2, // 0010
  DELETE: 4, // 0100
  ADMIN: 8, // 1000
};

let userPermissions = PERMISSIONS.READ | PERMISSIONS.WRITE; // User can read and write
let hasWriteAccess = (userPermissions & PERMISSIONS.WRITE) !== 0; // Check specific permission
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

Control flow statements determine the order in which your code executes. They allow your program to make decisions, repeat actions, and respond to different conditions.

**Conditional Statements:**

- **if/else:** Make decisions based on conditions

  ```js
  if (user.age >= 18) {
    console.log("Adult user");
  } else {
    console.log("Minor user");
  }

  // Multiple conditions
  if (score >= 90) {
    grade = "A";
  } else if (score >= 80) {
    grade = "B";
  } else {
    grade = "C";
  }
  ```

- **switch:** Handle multiple specific values efficiently
  ```js
  switch (userRole) {
    case "admin":
      showAdminPanel();
      break;
    case "moderator":
      showModeratorTools();
      break;
    case "user":
      showUserDashboard();
      break;
    default:
      showGuestView();
  }
  ```

**Loops:**

- **for loop:** When you know how many times to repeat

  ```js
  // Process each item in an array
  for (let i = 0; i < users.length; i++) {
    console.log(`User ${i + 1}: ${users[i].name}`);
  }
  ```

- **while loop:** Repeat while a condition is true

  ```js
  let attempts = 0;
  while (attempts < 3 && !loginSuccessful) {
    attemptLogin();
    attempts++;
  }
  ```

- **do...while:** Execute at least once, then repeat while condition is true
  ```js
  let userInput;
  do {
    userInput = prompt("Enter a number between 1-10:");
  } while (userInput < 1 || userInput > 10);
  ```

**Loop Control:**

- **break/continue:** Control loop execution

  ```js
  for (let user of users) {
    if (user.status === "banned") continue; // Skip banned users
    if (user.role === "admin") break; // Stop at first admin
    processRegularUser(user);
  }
  ```

- **return:** Exit function and optionally return a value

  ```js
  function calculateDiscount(price, userType) {
    if (price <= 0) return 0; // Early exit for invalid price

    if (userType === "premium") {
      return price * 0.2; // 20% discount
    }
    return price * 0.1; // 10% discount
  }
  ```

### Function Syntax

Functions are reusable blocks of code that perform specific tasks. JavaScript offers several ways to create functions, each with different characteristics and use cases.

- **Function declaration:** Traditional way to define functions. These are "hoisted" (available before they're defined in the code)

  ```js
  function greet(name) {
    return `Hello, ${name}!`;
  }

  // You can call this before it's defined due to hoisting
  let message = greet("Alice"); // "Hello, Alice!"
  ```

- **Function expression:** Assigns a function to a variable. Not hoisted, so must be defined before use

  ```js
  const greet = function (name) {
    return `Hello, ${name}!`;
  };

  // Functions can be passed as arguments to other functions
  const processUser = function (user, callback) {
    const greeting = callback(user.name);
    console.log(greeting);
  };
  ```

- **Arrow function:** Shorter syntax, commonly used in modern JavaScript. Doesn't have its own `this` context

  ```js
  // Concise for simple operations
  const add = (a, b) => a + b;
  const square = (x) => x * x; // Single parameter doesn't need parentheses

  // Great for array methods
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map((num) => num * 2); // [2, 4, 6, 8, 10]
  const evens = numbers.filter((num) => num % 2 === 0); // [2, 4]
  ```

- **Immediately Invoked Function Expression (IIFE):** Runs immediately when defined, useful for creating isolated scope

  ```js
  (function () {
    // Variables here don't pollute global scope
    const privateVariable = "This won't conflict with other code";
    console.log("This runs immediately!");
  })();

  // Modern alternative using arrow functions
  (() => {
    console.log("Also runs immediately!");
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
  colour: red;
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
