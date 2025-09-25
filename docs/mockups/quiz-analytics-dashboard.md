# Quiz Analytics Dashboard - Mockup Design

## Overview
Full-screen analytics dashboard inspired by Google Forms and Microsoft Forms, displaying comprehensive quiz performance data with interactive charts and metrics.

---

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Analytics          Quiz Analytics - Sample Quiz Title        │
│                               Detailed reporting and insights            │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 👥           │  │ ✓            │  │ 📈           │  │ Published    │ │
│  │ Total        │  │ Completion   │  │ Avg Time     │  │ ●            │ │
│  │ Responses    │  │ Rate         │  │ to Complete  │  │ Live         │ │
│  │              │  │              │  │              │  │              │ │
│  │    247       │  │    87.5%     │  │   4m 32s     │  │ 247 total    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Response Trend                              🔽 Last 7 Days          │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                              ●  │ │ │
│  │  │                                                    ●        /   │ │ │
│  │  │                              ●           ●      /          /    │ │ │
│  │  │              ●         ●   /           /      /          /      │ │ │
│  │  │        ●   /         /    /          /      /          /        │ │ │
│  │  │      /    /        /     /          /      /          /         │ │ │
│  │  │    /     /        /     /          /      /          /          │ │ │
│  │  │  ●─────●─────●─────●─────●─────●─────●                          │ │ │
│  │  │  Mon   Tue   Wed   Thu   Fri   Sat   Sun                        │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │  Question Performance            │  │  Answer Distribution         │ │
│  │  ┌─────────────────────────────┐ │  │  Q1: What is your role?      │ │
│  │  │ Q1 ████████████░░░  87%    │ │  │  ┌────────────────────────┐  │ │
│  │  │ Q2 ███████████████  92%    │ │  │  │        ╱───╲            │ │
│  │  │ Q3 ██████████░░░░░  73%    │ │  │  │    ╱───────╲──╲        │ │
│  │  │ Q4 ████████████████ 95%    │ │  │  │   │ Student  │  │       │ │
│  │  │ Q5 █████████████░░  84%    │ │  │  │   │   45%    │  │       │ │
│  │  │ Q6 ██████████████░  89%    │ │  │  │    ╲─────────  │       │ │
│  │  └─────────────────────────────┘ │  │  │      ╲───── Professional│ │
│  │                                   │  │  │         35% │  │       │ │
│  │  📊 Average: 86.7%                │  │  │              ╲──╲      │ │
│  └──────────────────────────────────┘  │  │                Other    │ │
│                                         │  │                 20%     │ │
│  ┌─────────────────────────────────────┤  └────────────────────────┘  │ │
│  │  📄 Individual Responses            │  │                          │ │
│  │  ┌────────────────────────────────┐ │  │  🔽 Select Question      │ │
│  │  │ Session | Name | Email | Score │ │  └──────────────────────────┘ │
│  │  ├────────────────────────────────┤ │                                │
│  │  │ abc123  | John | j@... | 92%  │ │                                │
│  │  │ def456  | Jane | ja..  | 88%  │ │                                │
│  │  │ ghi789  | Mike | m@... | 95%  │ │                                │
│  │  └────────────────────────────────┘ │                                │
│  │                                     │                                │
│  │  📥 Export CSV                      │                                │
│  └─────────────────────────────────────┘                                │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. **Header Section**
- Back navigation button (← Back to Analytics)
- Quiz title with icon
- Subtitle: "Detailed reporting and insights"

### 2. **Metrics Cards Row** (4 cards)
- **Card 1: Total Responses**
  - Icon: Users (👥)
  - Large number: "247"
  - Label: "Total Responses"

- **Card 2: Completion Rate**
  - Icon: CheckCircle (✓)
  - Large percentage: "87.5%"
  - Label: "Completion Rate"

- **Card 3: Average Time**
  - Icon: Clock (⏱)
  - Time display: "4m 32s"
  - Label: "Avg Time to Complete"

- **Card 4: Status**
  - Icon: Badge indicator (●)
  - Status badge: "Published / Live"
  - Sub-text: "247 total submissions"

### 3. **Response Trend Chart** (Full Width)
- Title: "Response Trend"
- Date range selector: Dropdown (Last 7 Days / Last 30 Days / Custom)
- **Line/Area Chart:**
  - X-axis: Days (Mon-Sun or dates)
  - Y-axis: Number of responses
  - Gradient fill under line
  - Hover tooltips with exact counts
  - Smooth curve interpolation

### 4. **Two-Column Analytics Section**

#### Left Column: **Question Performance**
- Title: "Question Performance"
- **Horizontal Bar Chart:**
  - Each bar represents a question (Q1, Q2, Q3...)
  - Color-coded by performance (green > 80%, yellow 60-80%, red < 60%)
  - Percentage label on right
  - Average performance metric at bottom

#### Right Column: **Answer Distribution**
- Title: "Answer Distribution"
- Question selector dropdown
- **Pie/Donut Chart:**
  - Each slice = answer option
  - Percentage labels
  - Legend with colors
  - Interactive hover states

### 5. **Individual Responses Table** (Full Width)
- Title: "📄 Individual Responses"
- **Data Table:**
  - Columns: Session ID | Name | Email | Score | Submitted At
  - Sortable headers
  - Pagination (10/25/50 per page)
  - Search/filter functionality
- **Export Button:**
  - "📥 Export CSV" button
  - Downloads all response data

---

## Color Scheme (Following Shadcn Pattern)

```css
--chart-1: oklch(0.61 0.27 142)    /* Green - High performance */
--chart-2: oklch(0.70 0.19 85)     /* Yellow - Medium */
--chart-3: oklch(0.65 0.24 27)     /* Orange - Needs attention */
--chart-4: oklch(0.55 0.24 261)    /* Purple - Accent */
--chart-5: oklch(0.59 0.23 329)    /* Pink - Secondary */
```

---

## Interaction Patterns

### Chart Interactions:
1. **Response Trend Chart:**
   - Hover: Show tooltip with exact count
   - Click data point: Filter responses by that date
   - Drag to select date range

2. **Question Performance Bars:**
   - Hover: Show question text in tooltip
   - Click: Jump to answer distribution for that question

3. **Answer Distribution Pie:**
   - Hover: Highlight slice, show count + percentage
   - Click slice: Filter individual responses by that answer

4. **Individual Responses Table:**
   - Click row: Expand to show full response details
   - Sort by any column
   - Search box for filtering

---

## Responsive Behavior

### Desktop (>1024px):
- 4-column metrics grid
- Side-by-side charts (Question Performance | Answer Distribution)
- Full-width table

### Tablet (768px - 1024px):
- 2-column metrics grid (2 rows)
- Stacked charts (full width each)
- Full-width table with horizontal scroll

### Mobile (<768px):
- 1-column metrics grid
- Stacked charts
- Simplified table (cards view instead of table)

---

## Data Requirements

### New Fields Needed:
1. `responses.started_at` - To calculate completion time
2. `responses.completed_at` - Current `submitted_at` can be renamed
3. Calculated fields:
   - Completion duration (completed_at - started_at)
   - Score (correct answers / total questions)
   - Date aggregations (by day/week/month)

### Aggregation Queries:
```sql
-- Response trend over time
SELECT DATE(submitted_at) as date, COUNT(*) as count
FROM responses
WHERE quiz_id = ?
GROUP BY DATE(submitted_at)
ORDER BY date DESC
LIMIT 30

-- Question performance (% correct)
SELECT question_id,
       COUNT(*) as total,
       SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
FROM response_answers
WHERE quiz_id = ?
GROUP BY question_id

-- Answer distribution per question
SELECT answer_value, COUNT(*) as count
FROM response_answers
WHERE quiz_id = ? AND question_id = ?
GROUP BY answer_value
```

---

## Implementation Priority

### Phase 1 (MVP):
1. ✅ Metrics cards (already have)
2. 📊 Response trend line chart
3. 📊 Question performance bar chart
4. ✅ Individual responses table (already have)

### Phase 2 (Enhanced):
5. 📊 Answer distribution pie charts
6. 🔍 Date range filtering
7. 📥 Enhanced CSV export with charts

### Phase 3 (Advanced):
8. 🕐 Completion time tracking
9. 📈 Comparison views (time periods)
10. 🎨 Custom chart themes

---

## Technical Stack

### Libraries:
- **Recharts** (primary charting library)
- **date-fns** (date manipulation)
- **react-window** (virtualized table for large datasets)

### Components to Create:
```
src/features/quiz-analytics/components/
├── QuizAnalyticsDashboard.tsx
├── ResponseTrendChart.tsx
├── QuestionPerformanceChart.tsx
├── AnswerDistributionChart.tsx
└── AnalyticsFilters.tsx
```

### Hooks:
```
src/features/quiz-analytics/hooks/
├── useQuizAnalytics.ts
├── useResponseTrends.ts
└── useQuestionStats.ts
```