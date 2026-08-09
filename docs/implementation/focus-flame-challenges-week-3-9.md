# Focus Flame Challenges — Weeks 3–9

Status: implemented locally against the staging-connected application; not deployed.

The Focus Flame Challenge layer is supplemental to the nine authoritative Caiden story quests. No existing story mission ID, prompt, answer, route, or progression record was replaced. The new content uses `GameAssessmentFlow`, the existing Caiden presentation, module tracking, sounds, completion badges, persistence, and responsive layouts.

| Week | ID | Mission | Difficulty | Badge | Scenarios | Status |
|---:|---|---|---|---|---:|---|
| 3 | `focus-flame-week-3` | Focus Recovery | Beginner | Focus Recovery Badge | 8 | published |
| 4 | `focus-flame-week-4` | Planning Power | Intermediate | Planning Power Badge | 8 | published |
| 5 | `focus-flame-week-5` | Time Detective | Intermediate | Time Detective Badge | 8 | published |
| 6 | `focus-flame-week-6` | Beat the Distraction | Intermediate | Distraction Defender Badge | 8 | published |
| 7 | `focus-flame-week-7` | Mission Organizer | Intermediate | Organization Expert Badge | 8 | published |
| 8 | `focus-flame-week-8` | Finish Strong | Advanced | Perseverance Badge | 8 | published |
| 9 | `focus-flame-week-9` | Focus Champion | Advanced | Focus Champion Badge | 8 | published |

The primary language target is Grades 3–6. The mission model includes an empty adaptation map for future K–2 or Grades 7–8 variants without duplicating the initial bank.

Every scenario has a stable `ffc-w<week>-c<number>` ID, week/mission metadata, difficulty, skills, interaction type, illustration key, badge value, and publication status. Choice interactions use four options and answer-specific constructive coaching. Sequence interactions use four unique steps and an exact ordered answer. Week 9 includes two multi-step sequence challenges.

Challenge cards appear in a separate section of the existing Caiden Hub. A challenge remains locked while its matching authoritative story quest is locked, becomes available when that quest is active/available/completed, and retains completed status from the existing module-results system. Adding the data does not unlock a future week or reset prior completion data.
