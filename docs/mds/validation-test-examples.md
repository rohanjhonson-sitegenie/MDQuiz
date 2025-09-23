# Validation Test Examples

This file contains examples that will fail validation - use these to test the validation system.

**⚠️ WARNING: This quiz will NOT pass validation and cannot be published!**

## Valid Section (for comparison)

## Q1
What is a valid multiple choice question?

- [ ] Wrong answer
- [x] Correct answer
- [ ] Another wrong answer

## Invalid Examples Below

## Q2
This multiple choice question has no options and will fail validation.

## Q3
This multiple choice question has options but no correct answer:

- [ ] Option 1
- [ ] Option 2
- [ ] Option 3

## Q4
This multiple choice question has only one option:

- [x] Only option

## Q5
This true/false question has no True/False line and will fail.

## Q6
This text input question has no answer.

## Q7
This text input question has an empty answer:

Answer:

## Q8
This question has no question text after the header.

## Q9

This question header is followed by empty question text.

## Expected Validation Errors

When you load this file in the quiz editor, you should see:

1. **Question 2**: "Multiple choice questions must have at least 2 options"
2. **Question 3**: "Multiple choice questions must have at least one correct answer"
3. **Question 4**: "Multiple choice questions must have at least 2 options"
4. **Question 5**: "True/false questions must have exactly one correct answer"
5. **Question 6**: "Text input questions must have a correct answer"
6. **Question 7**: "Text input questions must have a correct answer"
7. **Question 8**: "Question text is required"
8. **Question 9**: "Question text is required"

The quiz will show **8 validation errors** and the publish button will be disabled until all issues are fixed.