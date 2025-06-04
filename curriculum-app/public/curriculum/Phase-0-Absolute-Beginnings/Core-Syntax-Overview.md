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

**Key insight:** The `+` operator has dual behavior - it adds numbers but concatenates strings. JavaScript will convert numbers to strings when mixed: `5 + "3"` becomes `"53"`, not `8`.

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
// Let's look at the numbers in binary:
// mask = 0b1100;  (This is binary for decimal 12: 8 + 4 + 0 + 0)
// value = 0b1010; (This is binary for decimal 10: 8 + 0 + 2 + 0)
let mask = 0b1100;
let value = 0b1010;

// The bitwise AND (&) compares each bit:
//   1100 (mask)
// & 1010 (value)
// ------
//   1000 (result is 8 in decimal, because only the first bit was 1 in both numbers)
let result = mask & value;
console.log(result); // Output: 8

// Real-world example: Permission checking
const PERMISSIONS = {
  READ: 1, // Binary: 0001
  WRITE: 2, // Binary: 0010
  DELETE: 4, // Binary: 0100
  ADMIN: 8, // Binary: 1000 (Can be any combination, often powers of 2)
};

// User is granted READ and WRITE permissions.
// The bitwise OR (|) combines permissions:
//   0001 (READ)
// | 0010 (WRITE)
// ------
//   0011 (This is 3 in decimal, representing combined permissions)
let userPermissions = PERMISSIONS.READ | PERMISSIONS.WRITE;
console.log(userPermissions); // Output: 3

// To check if a user has a specific permission (e.g., WRITE):
// We use bitwise AND (&) with the permission we're checking for.
//   0011 (userPermissions)
// & 0010 (PERMISSIONS.WRITE)
// ------
//   0010 (This is 2 in decimal. Since it's not 0, the permission exists)
let hasWriteAccess = (userPermissions & PERMISSIONS.WRITE) !== 0;
console.log(hasWriteAccess); // Output: true

// To check for a permission the user doesn't have (e.g., DELETE):
//   0011 (userPermissions)
// & 0100 (PERMISSIONS.DELETE)
// ------
//   0000 (This is 0 in decimal. Since it's 0, the permission does NOT exist)
let hasDeleteAccess = (userPermissions & PERMISSIONS.DELETE) !== 0;
console.log(hasDeleteAccess); // Output: false
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
let obj = { nested: { prop: "Hello!" } };
let arr1 = [1, 2, 3];

// Optional Chaining (?.) - Safely access nested properties.
// If 'obj' or 'obj.nested' is null or undefined, 'value' will be undefined instead of causing an error.
let value = obj?.nested?.prop;
console.log(value); // Output: "Hello!"

let missingValue = obj?.other?.prop;
console.log(missingValue); // Output: undefined

// Spread operator (...) for arrays - Expands 'arr1' and adds 4 to create a new array.
let arr2 = [...arr1, 4];
console.log(arr2); // Output: [1, 2, 3, 4]

// Rest parameter (...) for functions - Collects all passed arguments into an array called 'nums'.
function sum(...nums) {
  // The reduce() method executes a reducer function on each element of the array,
  // resulting in a single output value.
  // 'a' is the accumulator (starts at 0), 'b' is the current element.
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // Output: 6
console.log(sum(5, 10, 15, 20)); // Output: 50

// 'in' operator - Checks if a property name (as a string) exists in an object.
if ("nested" in obj) {
  console.log("Property 'nested' exists in obj"); // This will be logged
}

// 'instanceof' operator - Checks if an object is an instance of a particular constructor (e.g., Array).
if (arr1 instanceof Array) {
  console.log("arr1 is an Array"); // This will be logged
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
  const obj = { key: "value" };
  console.log(obj.key); // Output: "value"
  console.log(obj["key"]); // Output: "value"
  ```
- **Shorthand property:** (When variable name and property key are the same)
  ```js
  let x = 1;
  let y = "hello";
  let obj = { x, y }; // Same as { x: x, y: y }
  console.log(obj); // Output: { x: 1, y: "hello" }
  ```
- **Computed property:** (Use an expression for a property key)
  ```js
  let keyName = "age";
  let person = {
    name: "Alice",
    [keyName]: 30, // The property name becomes "age"
  };
  console.log(person); // Output: { name: "Alice", age: 30 }
  ```
- **Method syntax:** (Functions as properties of an object)

  ```js
  let greeter = {
    message: "Hello",
    greetUser(userName) {
      return `${this.message}, ${userName}!`;
    },
  };
  console.log(greeter.greetUser("Bob")); // Output: "Hello, Bob!"
  ```

- **Common Array Methods:**
  JavaScript provides many powerful methods for working with arrays. Here are a few fundamental ones:

  ```js
  const numbers = [1, 2, 3, 4, 5];

  // arr.map(): Creates a new array by applying a function to each element.
  // (element) => element * 2  -- This function doubles each element.
  const doubledNumbers = numbers.map((num) => num * 2);
  console.log(doubledNumbers); // Output: [2, 4, 6, 8, 10]

  // arr.filter(): Creates a new array with elements that pass a test (return true).
  // (element) => element > 2  -- This function checks if an element is greater than 2.
  const numbersGreaterThanTwo = numbers.filter((num) => num > 2);
  console.log(numbersGreaterThanTwo); // Output: [3, 4, 5]

  // arr.reduce(): Applies a function against an accumulator and each element
  // to reduce the array to a single value.
  // (accumulator, currentValue) => accumulator + currentValue  -- This function sums elements.
  // 0 is the initial value of the accumulator.
  const sumOfNumbers = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  console.log(sumOfNumbers); // Output: 15 (1+2+3+4+5)
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
