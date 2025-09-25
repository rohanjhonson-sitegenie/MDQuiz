# Mixed Mode Quiz Settings Guide

Mixed mode quizzes can now include the same powerful settings as sectioned quizzes. Add a settings line right after the quiz title and description to configure the behavior.

## Settings Format

Add settings using the blockquote format:

```markdown
# Quiz Title

Description of your quiz.

> Settings: time_limit_minutes=15, allow_backward_navigation=true, allowed_question_types=["multiple_choice", "true_false", "text_input"], show_section_feedback=true, passing_threshold=75

## Q1
Your first question...
```

## Available Settings

### Time Management
- **`time_limit_minutes`**: Total time limit for the entire quiz (number)
  - Example: `time_limit_minutes=20` (20 minutes for the whole quiz)
  - Set to 0 or omit for no time limit

### Navigation Control
- **`allow_backward_navigation`**: Can users go back to previous questions? (true/false)
  - `true`: Users can navigate backward through questions
  - `false`: Users can only move forward (prevents changing answers)

### Question Type Restrictions
- **`allowed_question_types`**: Array of allowed question types
  - Available types: `["multiple_choice", "true_false", "text_input"]`
  - Example: `allowed_question_types=["multiple_choice", "true_false"]`
  - Omit to allow all question types

### Feedback & Scoring
- **`show_section_feedback`**: Show feedback after quiz completion? (true/false)
  - `true`: Show detailed feedback and explanations
  - `false`: Only show final score

- **`passing_threshold`**: Minimum percentage to pass the quiz (number 0-100)
  - Example: `passing_threshold=75` (need 75% to pass)
  - Omit for no pass/fail scoring

## Example Mixed Mode Quizzes

### Basic Quiz with Timer
```markdown
# JavaScript Fundamentals

Test your JavaScript knowledge!

> Settings: time_limit_minutes=15, passing_threshold=70

## Q1
What is a closure?
Answer: A function that has access to variables in its outer scope
```

### Strict Forward-Only Quiz
```markdown
# Final Exam

Important: You cannot go back once you answer!

> Settings: allow_backward_navigation=false, time_limit_minutes=30, passing_threshold=80

## Q1
Which of the following is correct?
- [x] Correct answer
- [ ] Wrong answer
```

### Multiple Choice Only Quiz
```markdown
# Quick Assessment

Only multiple choice questions allowed.

> Settings: allowed_question_types=["multiple_choice"], show_section_feedback=true

## Q1
Select the best option:
- [x] Best option
- [ ] Other option
```

## Currently Working Settings

✅ **Fully Implemented:**
- `time_limit_minutes` - Timer functionality works
- `allow_backward_navigation` - Navigation control works
- `allowed_question_types` - Question type filtering works

🔄 **Partially Implemented:**
- `show_section_feedback` - UI setting exists, logic needed
- `passing_threshold` - Schema defined, scoring logic needed

## Notes

- Settings apply to the entire quiz in mixed mode
- If no settings are specified, default behavior is used
- Settings line must be in blockquote format (`> Settings: ...`)
- All settings are optional - specify only what you need