# Section-Based Quiz System - Implementation Guide

## 📋 Overview

This guide walks you through implementing the dynamic section-based quiz system. The implementation provides:

- **Sectioned Quiz Structure**: Organize questions into groups with specific settings
- **Mixed Quiz Support**: Maintain backward compatibility with existing flat structure
- **Dynamic Validation**: Question type validation based on section constraints
- **Enhanced Markdown**: Extended syntax for section definitions

## 🗄️ Database Changes Applied

### ✅ Migration File Created
**File**: `supabase/migrations/07_add_quiz_sections.sql`

**What it includes**:
- New `quiz_sections` table
- Added `section_id` column to `questions` table (nullable for backward compatibility)
- Indexes for performance optimization
- RLS policies following existing patterns
- Helper functions for quiz structure detection and migration

### ✅ Schema Features
- **Backward Compatible**: Existing quizzes continue to work (section_id = NULL)
- **Flexible Settings**: JSONB field for section-specific configuration
- **Helper Functions**:
  - `get_quiz_structure_type(quiz_uuid)` - Returns 'mixed' or 'sectioned'
  - `create_default_section_for_quiz(quiz_uuid, title)` - Auto-migration utility

## 🔧 Manual Implementation Steps

### Step 1: Apply Database Migration

```bash
# Navigate to your project
cd C:\Users\rohan\Documents\MDQuiz\mdquiz

# Apply the migration
npx supabase db push

# Verify the migration
npx supabase db diff
```

### Step 2: Update Repository Layer

**File to modify**: `src/services/quiz-repository.ts`

Add these methods to your repository:

```typescript
// Add to QuizRepository interface in quiz.types.ts
export interface QuizRepository {
  // ... existing methods

  // Section management
  getSectionsByQuizId(quizId: string): Promise<QuizSection[]>
  createSection(section: Omit<QuizSection, 'id' | 'created_at' | 'updated_at'>): Promise<QuizSection>
  updateSection(id: string, updates: Partial<QuizSection>): Promise<QuizSection>
  deleteSection(id: string): Promise<void>
  reorderSections(quizId: string, sectionOrders: { id: string; order_index: number }[]): Promise<void>

  // Question-section assignment
  moveQuestionToSection(questionId: string, sectionId: string | null): Promise<void>
  getQuestionsWithSections(quizId: string): Promise<Question[]>
}
```

Implementation in your repository service:

```typescript
// Add these methods to your SupabaseQuizRepository class

async getSectionsByQuizId(quizId: string): Promise<QuizSection[]> {
  const { data, error } = await this.supabase
    .from('quiz_sections')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index')

  if (error) throw error
  return data || []
}

async createSection(section: Omit<QuizSection, 'id' | 'created_at' | 'updated_at'>): Promise<QuizSection> {
  const { data, error } = await this.supabase
    .from('quiz_sections')
    .insert(section)
    .select()
    .single()

  if (error) throw error
  return data
}

async updateSection(id: string, updates: Partial<QuizSection>): Promise<QuizSection> {
  const { data, error } = await this.supabase
    .from('quiz_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async deleteSection(id: string): Promise<void> {
  const { error } = await this.supabase
    .from('quiz_sections')
    .delete()
    .eq('id', id)

  if (error) throw error
}

async moveQuestionToSection(questionId: string, sectionId: string | null): Promise<void> {
  const { error } = await this.supabase
    .from('questions')
    .update({ section_id: sectionId })
    .eq('id', questionId)

  if (error) throw error
}

async getQuestionsWithSections(quizId: string): Promise<Question[]> {
  const { data, error } = await this.supabase
    .from('questions')
    .select(`
      *,
      section:quiz_sections(*)
    `)
    .eq('quiz_id', quizId)
    .order('order_index')

  if (error) throw error
  return data || []
}
```

### Step 3: Update Store Layer

**File to modify**: `src/stores/quizStore.ts`

Add section management to your Zustand store:

```typescript
// Add to QuizStore interface in quiz.types.ts
export interface QuizStore extends NavigationState {
  // ... existing properties
  sections: QuizSection[]
  selectedSectionId: string | null

  // ... existing actions

  // Section actions
  setSelectedSection: (sectionId: string | null) => void
  loadSections: (quizId: string) => Promise<void>
  createSection: (quizId: string, title: string) => Promise<void>
  updateSection: (sectionId: string, updates: Partial<QuizSection>) => Promise<void>
  deleteSection: (sectionId: string) => Promise<void>
  reorderSections: (sectionOrders: { id: string; order_index: number }[]) => Promise<void>
  moveQuestionToSection: (questionId: string, sectionId: string | null) => Promise<void>
  toggleQuizStructure: (quizId: string, structureType: 'mixed' | 'sectioned') => Promise<void>
}
```

### Step 4: Create UI Components

**Files to create**:

1. **`src/features/quiz-management/components/SectionEditor.tsx`**
```typescript
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { QuizSection } from '@/types/quiz.types'

interface SectionEditorProps {
  section: QuizSection
  onUpdate: (updates: Partial<QuizSection>) => void
  onDelete: () => void
}

export function SectionEditor({ section, onUpdate, onDelete }: SectionEditorProps) {
  // Implementation here - form for editing section title, description, settings
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Section editing form */}
      </CardContent>
    </Card>
  )
}
```

2. **`src/features/quiz-management/components/SectionList.tsx`**
```typescript
import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { QuizSection } from '@/types/quiz.types'

interface SectionListProps {
  sections: QuizSection[]
  selectedSectionId?: string
  onSectionSelect: (sectionId: string) => void
  onSectionReorder: (result: any) => void
}

export function SectionList({ sections, selectedSectionId, onSectionSelect, onSectionReorder }: SectionListProps) {
  // Implementation here - draggable list of sections
  return (
    <DragDropContext onDragEnd={onSectionReorder}>
      {/* Draggable section list */}
    </DragDropContext>
  )
}
```

3. **`src/features/quiz-management/components/QuizStructureToggle.tsx`**
```typescript
import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface QuizStructureToggleProps {
  currentMode: 'mixed' | 'sectioned'
  onModeChange: (mode: 'mixed' | 'sectioned') => void
  questionCount: number
}

export function QuizStructureToggle({ currentMode, onModeChange, questionCount }: QuizStructureToggleProps) {
  // Implementation here - toggle between mixed and sectioned modes
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={currentMode === 'sectioned'}
        onCheckedChange={(checked) => onModeChange(checked ? 'sectioned' : 'mixed')}
      />
      <Label>Use Sections</Label>
    </div>
  )
}
```

### Step 5: Update Quiz Editor

**File to modify**: `src/features/quiz-management/components/QuizEditorPane.tsx`

Add section management UI:

```typescript
import { SectionList } from './SectionList'
import { SectionEditor } from './SectionEditor'
import { QuizStructureToggle } from './QuizStructureToggle'
import { useQuizStore } from '@/stores/quizStore'

// Add to your QuizEditorPane component:
export function QuizEditorPane() {
  const {
    selectedQuiz,
    sections,
    selectedSectionId,
    setSelectedSection,
    loadSections,
    createSection,
    // ... other store methods
  } = useQuizStore()

  // Load sections when quiz is selected
  useEffect(() => {
    if (selectedQuiz?.id) {
      loadSections(selectedQuiz.id)
    }
  }, [selectedQuiz?.id])

  return (
    <div className="quiz-editor">
      {/* Quiz structure toggle */}
      <QuizStructureToggle
        currentMode={selectedQuiz?.settings?.structure_type || 'mixed'}
        onModeChange={(mode) => {
          // Handle structure mode change
        }}
        questionCount={selectedQuiz?.questions?.length || 0}
      />

      {/* Conditionally show section management */}
      {selectedQuiz?.settings?.structure_type === 'sectioned' && (
        <div className="sections-panel">
          <SectionList
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSection}
            onSectionReorder={(result) => {
              // Handle section reordering
            }}
          />
          {selectedSectionId && (
            <SectionEditor
              section={sections.find(s => s.id === selectedSectionId)!}
              onUpdate={(updates) => {
                // Handle section updates
              }}
              onDelete={() => {
                // Handle section deletion
              }}
            />
          )}
        </div>
      )}

      {/* Existing question editor */}
      {/* ... rest of your quiz editor */}
    </div>
  )
}
```

### Step 6: Update Validation System

**File to modify**: `src/lib/quiz-validation.ts`

Import and use the new validation system:

```typescript
import { QuestionTypeRegistry, SectionValidator } from './question-type-registry'
import type { QuizSection, Question } from '@/types/quiz.types'

// Add section validation
export function validateQuizSection(section: QuizSection): ValidationResult {
  return SectionValidator.validateSectionSettings(section.settings)
}

export function validateQuestionsAgainstSection(questions: Question[], section: QuizSection): ValidationResult {
  return SectionValidator.validateQuestionsAgainstSection(questions, section.settings)
}

// Enhanced question validation
export function validateQuestion(question: Question): ValidationResult {
  return QuestionTypeRegistry.validateQuestionOptions(question.question_type, question.options)
}
```

### Step 7: Test the New Markdown Format

Create a test quiz using the new section syntax:

**File**: `test-sectioned-quiz.md`

```markdown
# JavaScript Advanced Quiz

A comprehensive quiz covering advanced JavaScript concepts.

## Section: Variables and Scope
> Settings: time_limit_minutes=10, allowed_question_types=["multiple_choice","true_false"]

### Q1
What is the difference between let and var?
- [ ] No difference
- [x] Block scope vs function scope
- [ ] Performance difference
- [ ] let is deprecated

### Q2
JavaScript has block scoping.
True: let and const provide block scoping

## Section: Async Programming
> Settings: time_limit_minutes=15, allowed_question_types=["text_input","multiple_choice"]

### Q1
What does async/await replace?
Answer: Promise chains and .then() callbacks

### Q2
Which method runs promises in parallel?
- [ ] Promise.chain()
- [x] Promise.all()
- [ ] Promise.run()
- [ ] Promise.parallel()
```

## 🧪 Testing Checklist

### Database Tests
- [ ] Migration applies successfully
- [ ] Can create quiz sections
- [ ] Can move questions between sections
- [ ] RLS policies work correctly
- [ ] Helper functions return correct values

### UI Tests
- [ ] Quiz structure toggle works
- [ ] Section list displays correctly
- [ ] Section editor saves changes
- [ ] Drag and drop reordering works
- [ ] Question assignment to sections works

### Parser Tests
- [ ] New markdown format parses correctly
- [ ] Legacy format still works
- [ ] Section settings are parsed properly
- [ ] Mixed and sectioned modes detected correctly

### Validation Tests
- [ ] Question type constraints enforced
- [ ] Section settings validation works
- [ ] Invalid configurations show helpful errors

## 🚀 Deployment Steps

1. **Database Migration**
   ```bash
   npx supabase db push
   ```

2. **Generate Types**
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

3. **Run Tests**
   ```bash
   npm run test
   npm run typecheck
   ```

4. **Deploy to Production**
   ```bash
   npm run build
   npx supabase db push --linked
   ```

## 📊 Success Metrics

- ✅ Existing quizzes continue to work unchanged
- ✅ New sectioned quizzes can be created and managed
- ✅ Dynamic validation provides helpful feedback
- ✅ Performance remains optimal with new indexes
- ✅ UI is intuitive for section management

## 🔧 Troubleshooting

### Common Issues

1. **Migration Fails**
   - Ensure you're connected to the correct Supabase project
   - Check for existing data conflicts
   - Run `npx supabase status` to verify connection

2. **TypeScript Errors**
   - Regenerate types: `npx supabase gen types typescript --local`
   - Update imports in affected files
   - Check for missing interface properties

3. **RLS Policy Issues**
   - Verify user roles are set correctly
   - Check JWT token contains required claims
   - Test with different user permission levels

4. **Parser Issues**
   - Validate markdown syntax carefully
   - Check section settings JSON format
   - Ensure question headers use correct level (###)

## 📚 Next Steps

After basic implementation:

1. **Advanced Features**
   - Question pools and random selection
   - Conditional section branching
   - Advanced scoring algorithms
   - Section-level analytics

2. **Performance Optimizations**
   - Lazy loading of sections
   - Caching for frequently accessed quizzes
   - Optimistic UI updates

3. **User Experience**
   - Section preview mode
   - Bulk question operations
   - Template gallery for common section patterns

This implementation provides a solid foundation for dynamic, configurable quiz sections while maintaining full backward compatibility with your existing system.