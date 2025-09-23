# MDQuiz Markdown Format Guide

This guide explains the correct markdown format for creating quizzes that will pass validation in the MDQuiz system.

## Basic Structure

Every quiz must have the following structure:

```markdown
# Quiz Title

Optional quiz description goes here.

## Q1
Question text here
[Question options based on type]

## Q2
Question text here
[Question options based on type]

# Continue with more questions...
```

## Validation Rules

### Quiz Level Validation
- ✅ **Quiz title is required** (H1 heading)
- ✅ **At least one question required**
- ✅ **All questions must be valid**

### Question Level Validation
- ✅ **Question text is required**
- ✅ **Question type must be valid** (multiple_choice, true_false, text_input)
- ✅ **Question-specific requirements must be met**

## Question Types

### 1. Multiple Choice Questions

**Format:**
```markdown
## Q1
Question text here

- [ ] Wrong answer option
- [x] Correct answer option
- [ ] Another wrong option
- [x] Another correct option (for multiple correct answers)
```

**Validation Requirements:**
- ✅ At least 2 options required
- ✅ At least 1 correct answer required (`[x]`)
- ❌ Missing options will block publishing
- ❌ No correct answers will block publishing

**Examples:**

✅ **Valid Multiple Choice:**
```markdown
## Q1
What are valid JavaScript data types?

- [x] string
- [x] number
- [ ] integer
- [x] boolean
```

❌ **Invalid - No Options:**
```markdown
## Q1
What is JavaScript?
```

❌ **Invalid - No Correct Answer:**
```markdown
## Q1
What is JavaScript?

- [ ] A programming language
- [ ] A markup language
- [ ] A database
```

### 2. True/False Questions

**Format:**
```markdown
## Q1
Statement to evaluate

True: Explanation when true (this means the answer is True)
```

OR

```markdown
## Q1
Statement to evaluate

False: Explanation when false (this means the answer is False)
```

**Validation Requirements:**
- ✅ Must have exactly one correct answer
- ✅ Must include `True:` or `False:` line
- ❌ Missing True/False line will block publishing

**Examples:**

✅ **Valid True/False:**
```markdown
## Q1
JavaScript is a dynamically typed language.

True: JavaScript variables can change types at runtime
```

✅ **Valid True/False (False answer):**
```markdown
## Q1
JavaScript is a compiled language.

False: JavaScript is an interpreted language
```

❌ **Invalid - No True/False Line:**
```markdown
## Q1
JavaScript is dynamically typed.
```

### 3. Text Input Questions

**Format:**
```markdown
## Q1
Question text here

Answer: Expected answer text
```

**Validation Requirements:**
- ✅ Must have `Answer:` line with text
- ✅ Answer cannot be empty
- ❌ Missing answer will block publishing
- ❌ Empty answer will block publishing

**Examples:**

✅ **Valid Text Input:**
```markdown
## Q1
What method adds an element to the end of an array?

Answer: push
```

✅ **Valid Text Input (longer answer):**
```markdown
## Q1
Explain what a closure is in JavaScript.

Answer: A function that has access to variables in its outer scope even after the outer function returns
```

❌ **Invalid - No Answer:**
```markdown
## Q1
What is a closure?
```

❌ **Invalid - Empty Answer:**
```markdown
## Q1
What is a closure?

Answer:
```

## Question Headers

**Supported formats:**
- `## Q1`, `## Q2`, `## Q3`, etc.
- `## Question` (generic)

**Examples:**
```markdown
## Q1
First question...

## Q2
Second question...

## Question
Another question...
```

## Publishing Validation

When you attempt to publish a quiz, the system will:

1. **Check quiz title** - Must have H1 heading
2. **Check questions exist** - At least one question required
3. **Validate each question:**
   - Multiple Choice: ≥2 options, ≥1 correct answer
   - True/False: exactly one True: or False: line
   - Text Input: non-empty Answer: line
4. **Block publishing** if any validation fails
5. **Show detailed errors** for each issue found

## Error Messages You Might See

- **"Quiz title is required"** - Add `# Title` at the top
- **"Quiz must have at least one question"** - Add questions with `## Q1` format
- **"Multiple choice questions must have at least 2 options"** - Add more `- [ ]` options
- **"Multiple choice questions must have at least one correct answer"** - Mark at least one option with `[x]`
- **"True/false questions must have exactly one correct answer"** - Add `True:` or `False:` line
- **"Text input questions must have a correct answer"** - Add `Answer:` line with text

## Tips for Success

1. **Always test your quiz** - Use the preview pane to see validation errors
2. **Follow the exact format** - Spacing and syntax matter
3. **Include descriptions** - Add explanatory text after `True:`/`False:`/`Answer:`
4. **Check for typos** - `True:` not `true:`, `Answer:` not `answer:`
5. **Save frequently** - The system validates in real-time as you type

## Example Complete Quiz

See `example-quiz-format.md` in this folder for a complete, valid quiz example that passes all validation rules.