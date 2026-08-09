# Story Quest Source of Truth

This file records approved implementation decisions for the Kid Arcade Story Quest. Future passes should extend these decisions, not reinterpret or revert them.

## Product and mode

- Product: **Caiden Vale and the Focus Flame**
- Mode: **Story Quest**
- Current story: **The Dragon's Nest**
- Arcade role: Story Quest is the featured narrative experience.

## Story landing

- Cinematic presentation with the current chapter emphasized.
- Full B-4 companion beside the current adventure.
- Compact Journey Progress; View All Chapters remains secondary.
- Do not replace this with a six-card dashboard.
- Start Chapter goes directly into gameplay/questions.
- Enter Story goes directly to the current playable chapter question.
- Each chapter has exactly five primary question slots.
- Do not add reader, dialogue, Focus Clue, Step Forward, setup, canon-placeholder, or other interstitial screens between entry and questions.

## Approved student B-4 assets

- Large/prominent student B-4: `/images/Choose-Your-Guide/B-4student-hover.webp`
- Compact student B-4 Guide: `/images/Choose-Your-Guide/B-4student.webp`
- Compact avatars must use `object-fit: contain`, preserve the full open-eye head, and include internal padding.
- Do not substitute the white humanoid robot, old/closed-eye B-4 art, generated art, or a generic robot placeholder.

## Question philosophy

Story first -> comprehension -> interpretation -> SEL connection.

Every question must require knowledge of Caiden's actual adventure. Grade-band variants may change language and reasoning depth, but never the underlying canon. Distractors should be believable story misunderstandings, sequence confusion, or motivation confusion. B-4 hints should direct the child back to an event; feedback should explain the actual story connection after the answer.

If an answer, action, sequence, motivation, or distractor cannot be verified, mark the item `needs_canon_detail`. Never fill the gap with invented canon.
Items marked `needs_canon_detail` must never render in the child experience.

## Visual philosophy

Story Quest belongs to the Kid Arcade gaming ecosystem. Question moments support `scene`, `compact`, and `none` visual modes so artwork is used only when it helps comprehension.
Question imagery defaults to none. The large student B-4 supplies the primary visual personality.

## Preview

`/preview/arcade` must provide development access without portal authentication, access codes, parent/facilitator login, or a student PIN. The preview must follow Enter Story -> Question directly.

## Chapter rollout

Validate Chapter 1 pacing, accuracy, B-4 behavior, feedback, and imagery before populating Chapters 2-6. The approved Q1-Q30 structure may be represented in data, but later answer banks must remain unpopulated until their exact canon is confirmed.

### Chapter 2 - Courage in the Dark

- Approved source: `public/downloads/Weekly Module/CaidensCourage_Weekly 1_CourageInTheDark.pdf`.
- The questions in its Focus Flame Challenge and Answer Key are approved canon learning content and should be reused when appropriate.
- Do not substitute remembered story details when an approved module exists.
