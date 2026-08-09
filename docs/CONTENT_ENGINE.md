# Content Engine

## Model

`learning_question_sets` stores program/module scope, grade band, month/week, skill, status, and version. `learning_questions` stores ordered editable questions. Correct answers and explanations stay server/Admin-only. Learners receive an answer-safe projection from `learning-content`.

Supported grade bands are `k_2`, `3_5`, `6_8`, and `general`. Supported statuses are `draft`, `internal_review`, `educator_review`, `published`, and `archived`.

## Twelve-week structure

Month 1 is Weeks 1–4, Month 2 is Weeks 5–8, and Month 3 is Weeks 9–12. The seed framework covers courage in uncertainty; communication/asking for help; teamwork; leadership; empathy; problem solving; focus; resilience; friendship/trust; emotional regulation; self-advocacy/confidence; and reflection/celebration.

All 36 seeded sets are **draft**. Weeks 1–2 explicitly point back to the existing approved source-file content and do not overwrite it. Weeks 3–12 are clearly labeled story-alignment drafts. No seeded set appears to learners until an Admin publishes it.

Draft sample counts per weekly set:

- K–2: five student questions, two facilitator prompts, one family prompt.
- Grades 3–5: eight student questions, two facilitator prompts, one family prompt.
- Grades 6–8: ten student questions, two facilitator prompts, one family prompt.

## Question types and categories

Types: multiple choice, scenario, short response, open reflection, facilitator prompt, and family prompt. Categories support comprehension, recall, vocabulary, sequencing, inference, theme, motivation, SEL reflection, real-world application, critical thinking, and discussions.

K–2 metadata marks read-aloud compatibility. The learner component uses native labels, radios, textarea controls, 44px controls, keyboard navigation, mobile layouts, and preserved in-component responses between questions.

## Resolution

For the assigned program and current module, the server considers only `published` sets and selects:

1. Exact student grade band.
2. Program-default grade band.
3. `general`.
4. A safe “content is being prepared” state.

Within a band, the highest published version wins. Draft, review, and archived sets never reach learners.

## Admin workflow

Admin route: `/admin?tab=question-bank`. Filter by grade band, status, month, and week; duplicate a set; publish; archive; validate JSON; and export filtered JSON. Import validation is non-writing. Persisting an import remains deliberately disabled until review prevents accidental bulk replacement.

JSON shape uses question-set database fields plus a `questions` array. Validation requires title, valid grade band, module key, valid status, and question array. CSV uses one question per row; `answer_options` and `correct_answer` are JSON inside quoted CSV fields. Imports create new draft sets only and stop rather than overwrite a conflicting set.

## Learner route

`/play/session/:sessionId/learning-check/:weekNumber` resolves the active participant grade and loads the published set. It does not receive correct answers before submission. Scoring/submission is intentionally not activated until a server-side attempt endpoint can verify the authenticated/authorized learner relationship.

## Publishing checklist

1. Align prompts to final story text.
2. Review age/grade reading level and accessibility.
3. Verify answer options, correct answer, and explanation.
4. Run internal review, then educator review.
5. Preview the learner route on mobile and keyboard.
6. Publish one version; keep older results intact.

## Month 4 and beyond

Add sets with `month_number=4` and Weeks 13–16 using the same module keys, statuses, and versioning. No frontend change is needed. Update the skill map and educator-review evidence before publishing.
