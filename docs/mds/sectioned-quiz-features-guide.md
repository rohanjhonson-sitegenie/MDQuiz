# Sectioned Quiz Format & Features Guide

This guide explains the sectioned quiz format and how to test all the advanced features.

## Format Differences: Mixed vs Sectioned

### Mixed Format (Legacy)
```markdown
# Quiz Title
Description here

## Q1
Question text
- [ ] Option A
- [x] Option B

## Q2
Another question
Answer: Some answer
```

### Sectioned Format (New)
```markdown
# Quiz Title
Description here

## Section: Section Name
> Settings: key=value, key2=value2

### Q1
Question text
- [ ] Option A
- [x] Option B

### Q2
Another question
Answer: Some answer

## Section: Another Section
> Settings: different settings here

### Q1
More questions...
```

## Key Differences

1. **Questions use `### Q1`** instead of `## Q1`
2. **Sections start with `## Section: Name`**
3. **Settings are specified with `> Settings:`**
4. **Each section can have different configurations**

## Section Settings Reference

### Timing & Navigation
```markdown
> Settings: time_limit_minutes=10, allow_backward_navigation=false, require_completion_before_next=true
```

- **`time_limit_minutes`**: Time limit for this section (number)
- **`allow_backward_navigation`**: Can users go back to previous questions? (true/false)
- **`require_completion_before_next`**: Must complete this section before proceeding? (true/false)

### Question Type Restrictions
```markdown
> Settings: allowed_question_types=["multiple_choice", "true_false"], question_count_limit=5
```

- **`allowed_question_types`**: Array of allowed types: `["multiple_choice", "true_false", "text_input"]`
- **`question_count_limit`**: Maximum questions in this section (number)

### Scoring & Feedback
```markdown
> Settings: points_per_question=5, show_section_feedback=true, passing_threshold=70
```

- **`points_per_question`**: Points awarded per correct answer (number)
- **`show_section_feedback`**: Show feedback after section completion? (true/false)
- **`passing_threshold`**: Minimum percentage to pass this section (number)

### Display Options
```markdown
> Settings: shuffle_questions=true, questions_per_page=1, show_progress_bar=true
```

- **`shuffle_questions`**: Randomize question order in this section? (true/false)
- **`questions_per_page`**: How many questions per page (number, 0=all)
- **`show_progress_bar`**: Show progress within this section? (true/false)

## How to Test Each Feature

### 1. Individual Section Timing

**Setup:**
```markdown
## Section: Timed Section
> Settings: time_limit_minutes=2

### Q1
Quick question here
Answer: test
```

**Testing:**
1. Toggle to sectioned mode
2. Start taking the quiz
3. You should see a 2-minute timer for this section
4. Timer should reset for each section

### 2. Navigation Restrictions

**Setup:**
```markdown
## Section: Linear Section
> Settings: allow_backward_navigation=false, require_completion_before_next=true

### Q1
First question
Answer: must answer

### Q2
Second question
Answer: before proceeding
```

**Testing:**
1. Answer Q1, try to go back (should be disabled)
2. Leave Q2 blank, try to proceed (should be blocked)
3. Answer Q2, then you can proceed to next section

### 3. Question Type Restrictions

**Setup:**
```markdown
## Section: Multiple Choice Only
> Settings: allowed_question_types=["multiple_choice"]

### Q1
This should work
- [x] Correct
- [ ] Wrong

### Q2
This should be ignored or show error
Answer: text input not allowed
```

**Testing:**
1. The text input question should either be filtered out or show validation error
2. Only multiple choice questions should be processed

### 4. Section-Specific Scoring

**Setup:**
```markdown
## Section: High Value Section
> Settings: points_per_question=10, passing_threshold=80

### Q1
Important question
- [x] Correct answer
- [ ] Wrong answer

## Section: Low Value Section
> Settings: points_per_question=2, passing_threshold=50

### Q1
Less important question
Answer: easy answer
```

**Testing:**
1. Complete both sections
2. Check final score breakdown
3. First section should give 10 points, second gives 2 points
4. Different passing thresholds should apply per section

### 5. Progressive Disclosure

**Setup:**
```markdown
## Section: Foundation
> Settings: require_completion_before_next=true, questions_per_page=1

### Q1
Must complete this first
Answer: foundation

## Section: Advanced
> Settings: require_completion_before_next=false

### Q1
Only available after foundation
Answer: advanced topic
```

**Testing:**
1. Advanced section should be locked initially
2. Complete Foundation section
3. Advanced section should unlock
4. Questions appear one per page in Foundation

## Common Issues & Solutions

### Issue: Content Gets Overwritten When Toggling
**Problem**: Switching between mixed/sectioned modes replaces your content with template

**Current Code Problem**:
```typescript
// This overwrites instead of converting
return `# New Quiz

## Section: Main Questions
> Settings: time_limit=10, shuffle_questions=false

### Q1
Your question here...`
```

**Solution**: The transformation should preserve existing questions:
```typescript
// Should convert existing ## Q1 to ### Q1 format
// Should wrap in appropriate sections
// Should preserve all question content
```

### Issue: Settings Not Applied
**Problem**: Section settings aren't affecting quiz behavior

**Check**:
1. Settings format is correct: `key=value, key2=value2`
2. Values use proper JSON format: `true`/`false`, `"string"`, `number`
3. Array format: `["item1", "item2"]`

### Issue: Questions Not Grouping Correctly
**Problem**: Questions appear in wrong sections

**Check**:
1. Use `### Q1` for sectioned mode (three #)
2. Use `## Q1` for mixed mode (two #)
3. Section headers must be `## Section: Name`

## Testing Workflow

1. **Create a sectioned quiz** using the example format
2. **Toggle between modes** - content should preserve, not overwrite
3. **Test each feature individually** using the examples above
4. **Verify in preview pane** that settings are applied correctly
5. **Take the quiz** to test timing, navigation, scoring

## Next Steps

The current implementation has bugs in the transformation logic that need fixing:
1. `transformMixedToSectioned()` should preserve existing content
2. `transformSectionedToMixed()` should flatten sections properly
3. Both transformations should be bidirectional and lossless