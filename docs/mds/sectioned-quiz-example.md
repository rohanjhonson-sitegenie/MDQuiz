# Advanced JavaScript Concepts Quiz (Sectioned)

This quiz demonstrates all sectioned mode features including timing, navigation restrictions, question type limitations, and progressive scoring.

## Section: Basic Concepts
> Settings: time_limit_minutes=5, allow_backward_navigation=false, allowed_question_types=["multiple_choice", "true_false"], show_section_feedback=true, passing_threshold=70

### Q1
What is the difference between `let` and `var` in JavaScript?

- [ ] No difference, they are identical
- [x] `let` has block scope, `var` has function scope
- [ ] `var` is newer than `let`
- [ ] `let` can be hoisted, `var` cannot

### Q2
JavaScript is a single-threaded language.

True: JavaScript has one main thread but uses event loop for asynchronous operations

### Q3
What does the 'this' keyword refer to in arrow functions?

- [ ] The function itself
- [ ] The global object
- [x] The lexical scope where the function was defined
- [ ] Always undefined

## Section: Advanced Features
> Settings: time_limit_minutes=10, require_completion_before_next=true, allowed_question_types=["text_input", "multiple_choice"], points_per_question=5, show_progress_bar=true

### Q1
Explain the concept of closures in JavaScript with a practical example.

Answer: A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. Example: function outer() { let count = 0; return function inner() { count++; return count; }; } - the inner function forms a closure over the count variable.

### Q2
Which design pattern is commonly used for managing state in React applications?

- [ ] Observer Pattern
- [x] Flux/Redux Pattern
- [ ] Singleton Pattern
- [ ] Factory Pattern

### Q3
What is the output of: `console.log(typeof typeof 1)`?

Answer: string

## Section: Performance & Optimization
> Settings: time_limit_minutes=8, shuffle_questions=true, questions_per_page=1, show_section_feedback=false, allow_backward_navigation=true

### Q1
Which method creates a new array with all elements that pass a test implemented by the provided function?

- [ ] map()
- [x] filter()
- [ ] reduce()
- [ ] forEach()

### Q2
Event delegation is a technique that:

- [x] Attaches a single event listener to a parent element to handle events for multiple child elements
- [ ] Prevents event bubbling
- [ ] Creates multiple event handlers for better performance
- [ ] Automatically removes event listeners

### Q3
The V8 engine optimizes JavaScript code by:

- [x] Just-in-time (JIT) compilation
- [x] Inline caching
- [ ] Ahead-of-time (AOT) compilation only
- [ ] Interpreting code without compilation

## Section: Modern JavaScript
> Settings: time_limit_minutes=7, allowed_question_types=["true_false", "text_input"], section_summary_enabled=true, points_per_question=3

### Q1
Promises can be chained using `.then()` methods.

True: Promise chaining allows sequential asynchronous operations

### Q2
What keyword is used to handle errors in async/await syntax?

Answer: try-catch

### Q3
Template literals use backticks and support expression interpolation.

True: Template literals use `` ` `` and support ${expression} syntax for interpolation