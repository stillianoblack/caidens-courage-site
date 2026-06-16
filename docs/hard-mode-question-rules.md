# Hard Mode Question Quality Rules

Standards for **Hard** difficulty questions in Caiden's Courage adaptive missions (grades 4–5 and 6–8).

## Answer design

1. **No villain answers** — Wrong options must not all be extreme negative behaviors (yell, cheat, ignore, run away, give up). Each distractor should represent a plausible but less effective choice.
2. **All choices must be plausible** — A thoughtful learner should need the scenario or evidence to eliminate options, not common sense alone.
3. **Balanced length** — The correct answer should not be obviously longer or more detailed than distractors.
4. **No joke or cartoony distractors** — Avoid magic, disappearing, swimming pools, or absurd outcomes unless the scenario explicitly supports humor as a teaching device.

## Cognitive demand

Hard questions should test at least one of:

- **Tradeoffs** — Two reasonable paths with different consequences
- **Inference** — Conclusions supported by scenario evidence
- **Evidence** — Selecting the option best supported by details given
- **Sequencing** — Correct order of steps or priorities
- **Judgment** — Weighing context when more than one answer seems partially right

## Question wording

- Avoid **"What should…"** unless every answer requires real comparison, not a single obvious moral.
- Avoid **"Which is best…"** when one answer is clearly kinder or safer than the others.
- Prefer: *Which step comes first?*, *What evidence supports…?*, *What tradeoff matters most here?*

## Metadata requirements

Every hard question must include:

- `explanation` — Why the correct answer fits the scenario (not generic praise)
- Optional **"Why did you choose this?"** reflection prompt for facilitators or family debrief
- `difficulty` aligned to grade band (`advanced` / hard tier)
- `skillTags` tied to the mission skill focus

## Publication checklist

Before publishing a hard question:

- [ ] Scenario provides enough evidence for the correct answer
- [ ] At least two distractors are tempting for a real learner mistake
- [ ] Correct answer spelling uses **Caiden** (not Caden, Kayden, etc.)
- [ ] No duplicate scenario stem used more than 3 times in the same character mission set
- [ ] Passes `yarn audit:questions` without weak distractor or high-duplication flags
