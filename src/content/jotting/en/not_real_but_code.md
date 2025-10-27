---
title: "Just NCV Lang: Pseudo-Code That Lives in Notes"
timestamp: 2025-10-14 17:00:00+03:00  
last_updated_timestamp: 2025-10-14 21:00:00+03:00
series: SomeStrangeSeries  
tags: [Owner, Info]  
description: My pseudo-code is a hybrid of ideas from different languages, but always visible. Why is it cool? Because it focuses on the essence, not the details.
---

# Hello, Let's Talk About Pseudo-Code {id: "intro"}

When I started keeping notes, I faced a choice: should I write real code or use pseudo-code? You can still find both variants in the repository — traces of my experiments. But over time, I realized: pseudo-code is what I need. It doesn't compile, but it shows what working code should look like. Real code is powerful and specific, but sometimes too noisy.

Question to myself: Why not real code?

Answer: Because in the specifics of real code there's a lot of noise — syntax, compilation, errors. Pseudo-code discards this and puts the idea at the center. It's universal: easy to translate to Python, C++, Rust, or even a future language. Not all readers are experts in C++ or Python, and not everyone wants to deal with syntax when the goal is to understand the essence.

That's why I replace old code with my own pseudo-code — $Just\ NCV\ Lang$. It's a hybrid: a bit of Python, a bit of C++, a pinch of Rust. Strange? Yes, but it makes it unique, not like standard templates.

And here's one more thing: some notes will assume that the code there is exclusively in language X, where X is specified at the beginning of the note. For example, if "Python" is specified at the beginning, the pseudo-code will be closer to Python syntax. This helps adapt to context, but it still remains pseudo.

And remember: this pseudo-code and its syntax can expand. If you notice something unusual, check this page — the current version is always here.

# Just NCV Lang Syntax: Complete and Flexible {id: "syntax"}

The syntax as of 10.14.2025.

```just-ncv
# Just NCV Lang: Epic Pseudo-Syntax
# Comments — for clarity
# Syntax is flexible but strict — a mix of Rust, Python, and C++ on steroids.
```

## Variables and Constants {id: "variables"}
```just-ncv
var x: int = 42          # Variable with explicit type
const PI: float64 = 3.14159  # Constant with exact type
let y = "auto"           # Automatic type (type inference), like in Rust
mut z: int = 0           # Mutable variable (mut for changes)
```

## Data Types (Extended) {id: "types"}
```just-ncv
int32    # 32-bit integer
uint64   # 64-bit unsigned
float32  # 32-bit floating point
float64  # 64-bit (default)
str      # String
char     # Character (Unicode)
bool     # true/false
void     # Nothing (for functions)
null     # Emptiness
any      # Any type (dynamic)
tuple(int, str)  # Tuple: (42, "hello")
optional<int>    # May be int or null
union(int | str) # Union: either int or str
complex64        # Complex number (for math)
date             # Date: 2025-10-16
time             # Time: 16:19:56
datetime         # Date-time
array<int, 10>   # Fixed array (size 10)
vector<int>      # Dynamic array (vector)
map<str, int>    # Dictionary (hash-map)
```

## Arrays and Collections {id: "collections"}
```just-ncv
arr: vector<int> = [1, 2, 3]       # Dynamic array
dict: map<str, int> = {"key": 1, "val": 2}  # Dictionary
set: set<int> = {1, 2, 3}          # Set (unique elements)
queue: queue<int>                  # Queue (FIFO)
stack: stack<int>                  # Stack (LIFO)
linked_list: linked_list<int>      # Linked list
```

## Functions (with Improvements) {id: "functions"}
```just-ncv
func add(a: int, b: int) -> int:
    return a + b

func greet(name: str) -> str:
    return "Hello, " + name + "!"

# Lambda functions (anonymous)
lambda = func(x: int) -> int: x * 2
# Usage: map(lambda, arr)

# Asynchronous and concurrency
async func fetch_data(url: str) -> str:
    return await get(url)

# Goroutines (like in Go, for parallelism)
go func():
    print("In background!")
```

## Channels (for Communication) {id: "channels"}
```just-ncv
chan messages: chan<str>
go producer(messages)
go consumer(messages)
```

## Conditional Operators (with match for Pattern Matching) {id: "conditionals"}
```just-ncv
if x > 0:
    print("Positive")
elif x == 0:
    print("Zero")
else:
    print("Negative")

# Pattern matching (like in Rust/Scala)
match value:
    case 0: print("Zero")
    case 1..10: print("Small number")
    case str: print("String: " + value)
    case _: print("Other")  # Default
```

## Loops {id: "loops"}
```just-ncv
for i in 0..10:  # Range (inclusive)
    print(i)

while x < 10:
    x += 1

foreach item in arr:  # For collections
    print(item)

do:
    x -= 1
while x > 0  # Do-while
```

## Structures and Classes (with Interfaces) {id: "structs_classes"}
```just-ncv
struct Point:
    x: float64
    y: float64
    func distance(other: Point) -> float64:
        return sqrt((self.x - other.x)^2 + (self.y - other.y)^2)

interface Shape:
    func area() -> float64
    func perimeter() -> float64

class Hero impl Shape:
    name: str
    health: int
    
    func __init__(self, name: str, health: int):
        self.name = name
        self.health = health
    
    func attack() -> str:
        return self.name + " attacks!"
    
    func area() -> float64:  # Interface implementation
        return self.health * 1.0  # Example
    
    func perimeter() -> float64:
        return self.health * 2.0

# Enumerations (enums) with methods
enum Status:
    Active = 1
    Inactive = 0
    Pending = 2
    
    func is_active() -> bool:
        return self == Status.Active
```

## Generics with Constraints {id: "generics"}
```just-ncv
func swap<T>(a: T, b: T) -> (T, T) where T: Comparable:
    return (b, a)
```

## Modules and Imports (with Namespace) {id: "modules"}
```just-ncv
module math:
    const E = 2.718
    func sqrt(x: float64) -> float64: ...

import math                 # Import module
from utils import helper    # Import function
use std::collections::*     # Import everything from namespace (like in Rust)
export Point                # Export structure
export add                  # Export function
```

## Error Handling (with Unwrap and Panic) {id: "error_handling"}
```just-ncv
try:
    risky_func()
except ValueError as e:
    print("Value error: " + e)
except IOError:
    print("IO error")
finally:
    cleanup()

# Assertions and debug
assert x > 0: "x must be positive"
debug print("Debug: x = " + str(x))
```

## Pointers and References (like in C++, with Safety) {id: "pointers_references"}
```just-ncv
ptr: *int = &x              # Pointer (raw, unsafe)
ref: &int = &x              # Reference (safe, borrow)
*ptr = 100                  # Dereferencing (unsafe)
ref = 200                   # Change via reference
```

## Macros (for Metaprogramming) {id: "macros"}
```just-ncv
macro define_struct(name, fields):
    struct $name:
        $fields

define_struct(Person, name: str, age: int)
```

## Decorators (Annotations) {id: "decorators"}
```just-ncv
@deprecated
func old_func():
    return "Deprecated function"

@benchmark
func heavy_compute():
    # Long computations
```

## Built-in Functions and Operators {id: "builtins"}
```just-ncv
print("Hello, World!")       # Output
len(arr)                     # Collection length
type(x)                      # Variable type
range(0, 10, 2)             # Range with step
sort(arr)                    # Sorting (quicksort by default)
filter(lambda x: x > 0, arr) # Filtering
map(lambda x: x * 2, arr)    # Transformation
reduce(lambda a, b: a + b, arr, 0)  # Folding
zip(arr1, arr2)              # Combining collections
enumerate(arr)               # Indices + elements
```

## Operators (Extended) {id: "operators"}
```just-ncv
x += 5    # Add
x -= 2    # Subtract
x *= 3    # Multiply
x /= 4    # Divide
x %= 2    # Modulo
x **= 2   # Exponentiation
x &= 1    # Bitwise AND
x |= 2    # Bitwise OR
x ^= 3    # Bitwise XOR
x <<= 1   # Left shift
x >>= 1   # Right shift
```

## Special Constructs {id: "special"}
```just-ncv
defer cleanup()              # Deferred call (like in Go)
yield value                  # Generators (like in Python)
raise "Error!"               # Throw exception
with file as f:               # Context manager
    f.write("data")
```

Question to myself: Why is the syntax so broad?

Answer: Because notes are different — from simple algorithms to complex structures. The breadth helps cover more cases, but remains simple. If something new appears, I'll add it here.

Question to myself: What about languages?

Answer: If a note specifies language X at the beginning, the pseudo-code will be adapted to it, but will still remain pseudo — without real compilation. For example, for Python — more lists, for C++ — pointers.

Hey, this pseudo-code is my tool for notes. It lives, grows, and helps understand ideas without clutter. If something's strange — come back here.

---

## Frequently Asked Questions {id: "faq"}

**Question:** Will real code disappear completely?  
**Answer:** No, in some notes it will remain, especially if the syntax of a specific language is important. But the main focus is on pseudo-code.

**Question:** Why did you write your own pseudo-code?  
**Answer:** To have a flexible tool that focuses on ideas, not syntax details. This helps me and readers better understand the material.

**Question:** Can this pseudo-code be used in real projects?  
**Answer:** Of course, but remember that it's pseudo-code. It needs to be adapted to a specific language and environment.