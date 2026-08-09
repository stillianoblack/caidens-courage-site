# Week 3–9 Question Review

Generated from the application question registries on 2026-07-15T04:42:39.609Z.

## Publication truth

- The learner runtime currently reads these TypeScript adaptive mission banks directly; it does not read `learning_question_sets`.
- Weeks 3–4 are reviewed and runtime-active in the staging-connected local application.
- Weeks 5–9 are marked below as review drafts, but that status is **not enforced by the current static runtime**. They remain reachable wherever existing week-unlock rules allow them.
- Enforcing database-backed draft/published states requires the deferred learning-engagement schema and is intentionally not performed by this review.
- The source-of-truth week labels below are the labels already used by `src/data/familyWeeklyAdventures.ts`.

## Coverage summary

| Week | Existing product label | Focus | K–1 | 2–3 | 4–5 | 6–8 | Review status |
|---:|---|---|---:|---:|---:|---:|---|
| 3 | Better Together | Teamwork | 21 | 21 | 21 | 21 | reviewed / staging runtime-active |
| 4 | Staying Present | Focus | 15 | 15 | 15 | 15 | reviewed / staging runtime-active |
| 5 | Big Feelings | Emotional Awareness | 15 | 15 | 15 | 15 | draft review target; not runtime-enforced |
| 6 | Brave Choices | Decision Making | 20 | 20 | 20 | 20 | draft review target; not runtime-enforced |
| 7 | Solving Problems Together | Problem Solving | 17 | 17 | 17 | 17 | draft review target; not runtime-enforced |
| 8 | Keep Going | Perseverance | 17 | 17 | 17 | 17 | draft review target; not runtime-enforced |
| 9 | Focus Flame Celebration | Confidence + Reflection | 10 | 10 | 10 | 10 | draft review target; not runtime-enforced |

## Week 3 — Better Together

Product focus: **Teamwork**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | The Brave Choice Button (`b4-brave-choice-button`) | `src/data/b4/missions/mission3BraveChoiceButton.ts` | A friend drops their crayons. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, brave choice console (K-1). / A classmate looks sad and alone at recess. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, helpful-choice practice pad (K-1). / The teacher asks everyone to line up quietly. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, courage button bay (K-1). | B-4 | Brave Choices / Decision Making |
| charlie | The Mystery Sound (`charlie-mystery-sound`) | `src/data/charlie/missions/mission3MysterySound.ts` | During science club, a weird squeak keeps interrupting the room. Charlie wants to investigate before everyone decides the cabinets are haunted. / The squeak sounds like it comes from the back corner. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, club interruption corner (K-1). / Charlie hears the squeak again. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, mystery sound map (K-1). | Charlie | Active Listening / Attention |
| zeke | The Group Project Glitch (`zeke-group-project-glitch`) | `src/data/zeke/missions/mission3GroupProjectGlitch.ts` | What helps the group work together. Scene: In the cafeteria, Zeke pauses near a table with an open seat, poster project table (K-1). / Two kids want to color at the same time. Scene: In the cafeteria, Zeke pauses near a table with an open seat, group-plan clipboard (K-1). / Someone keeps talking over others. Scene: In the cafeteria, Zeke pauses near a table with an open seat, everyone-talks-at-once desk (K-1). | Zeke | Communication / Team Roles |
| caiden | Time Tracker (`quest-3`) | `src/data/caiden/questAdaptiveTimeTracker.ts` | Caiden has 10 minutes before the group leaves. He needs his water bottle, pencil, and notebook. / Caiden still needs to put on shoes and pack his folder. / The big hand on the clock is almost at the line. Recess starts soon. | Caiden | Time Management, Time Estimation, Scheduling, Planning |
| miranda | The Missing Clue (`miranda-mystery-file-3`) | `src/data/miranda/fileAdaptiveMissingClue.ts` | Miranda found a smudged note. One word was missing. A picture of a library door helped her figure it out. / Miranda found a note with one word missing. The note said, "Meet by the ____ after lunch." She looked at the picture beside the note. It showed a tree. Miranda knew the missing word was tree. / Miranda found a clue note on the floor. One word had been smudged: "Meet by the ____ after lunch." Next to the sentence was a small drawing of branches and leaves. Miranda compared the drawing to places around the school and realized the note probably pointed to the tree near the playground. | Miranda | Context Clues, Vocabulary, Inference, Reading Comprehension, Inference, Vocabulary, Context Clues, Evidence, Analysis |

### K-1 review set

Available: **21**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **A friend drops their crayons. What is a brave choice?**
   ID: `b4m3-k1-q1` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: A friend drops their crayons. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, brave choice console (K-1).
   Choices: A. Help pick them up **(correct)** · B. Laugh and walk away · C. Wait to help until someone else starts · D. Pretend the floor did it
   Explanation: Yes. Helping is a brave and kind choice.
2. **What should Charlie do when he hears the squeak?**
   ID: `cm3-k1-q1` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: During science club, a weird squeak keeps interrupting the room. Charlie wants to investigate before everyone decides the cabinets are haunted.
   Choices: A. Stop and listen carefully **(correct)** · B. Scream "ghost cabinet" · C. Cover every window · D. Blame his backpack
   Explanation: Great listening! Charlie pauses before he guesses.
3. **What helps the group work together?**
   ID: `zkm3-k1-q1` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: What helps the group work together. Scene: In the cafeteria, Zeke pauses near a table with an open seat, poster project table (K-1).
   Choices: A. Have one speaker at a time and assign roles · B. Take turns talking **(correct)** · C. Raise a hand and wait for your turn · D. Tear up the project page
   Explanation: Yes. Taking turns helps everyone be heard.
4. **What should he do?**
   ID: `cq3-k1-q1` · Character: caiden · Module: `quest-3`
   Scene: Caiden has 10 minutes before the group leaves. He needs his water bottle, pencil, and notebook.
   Choices: GRAB. Grab the three things he needs **(correct)** · COLOR. Start coloring a new page · TALK. Talk for 20 minutes · SIT. Sit down and wait
   Explanation: With only 10 minutes, Caiden should grab what he needs first.
5. **What was missing from the note?**
   ID: `mcl-k1-q1` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a smudged note. One word was missing. A picture of a library door helped her figure it out.
   Choices: A. A word **(correct)** · B. The whole note · C. Miranda's pencil · D. A backpack
   Explanation: One word was missing from the note.
6. **A classmate looks sad and alone at recess. What is a brave choice?**
   ID: `b4m3-k1-q2` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: A classmate looks sad and alone at recess. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, helpful-choice practice pad (K-1).
   Choices: A. Ask if they want to play **(correct)** · B. Watch from far away and hope someone else helps · C. Pause and notice one more detail first · D. Pretend you did not see them
   Explanation: Nice. A small hello can be a brave kindness.
7. **The squeak sounds like it comes from the back corner. What should Charlie do?**
   ID: `cm3-k1-q2` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: The squeak sounds like it comes from the back corner. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, club interruption corner (K-1).
   Choices: A. Look toward where the sound came from **(correct)** · B. Close his eyes and run · C. Make a louder squeak · D. Ignore the sound completely
   Explanation: Nice! Ears and eyes work together in science club.
8. **Two kids want to color at the same time. What should Zeke suggest?**
   ID: `zkm3-k1-q2` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: Two kids want to color at the same time. Scene: In the cafeteria, Zeke pauses near a table with an open seat, group-plan clipboard (K-1).
   Choices: A. You go first, then me **(correct)** · B. Fight for the crayons · C. Nobody gets to color · D. Set turns for shared materials
   Explanation: Nice. Turn-taking keeps the project calm.
9. **What helps Caiden know when to leave?**
   ID: `cq3-k1-q2` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: CLOCK. A clock **(correct)** · SNACK. A snack · PILLOW. A pillow · COMIC. A comic book
   Explanation: A clock shows how much time is left.
10. **What picture helped Miranda?**
   ID: `mcl-k1-q2` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a smudged note. One word was missing. A picture of a library door helped her figure it out.
   Choices: A. A library door **(correct)** · B. A soccer ball · C. A pizza · D. A rain cloud
   Explanation: The library door picture was an important clue.

### 2-3 review set

Available: **21**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **You do not understand the directions. What is a brave choice?**
   ID: `b4m3-23-q1` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: You do not understand the directions. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, brave choice console (2-3).
   Choices: A. Ask for help **(correct)** · B. Guess and feel upset · C. Push the paper away · D. Say the directions are broken
   Explanation: Correct. Asking for help is brave and smart.
2. **What can help Charlie solve the sound?**
   ID: `cm3-23-q1` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: What can help Charlie solve the sound. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, squeak hunt shelf (2-3).
   Choices: A. Notice when it happens **(correct)** · B. Guess without listening · C. Make a louder sound · D. Take a breath and keep listening for the pattern
   Explanation: Timing is a clue! When it squeaks matters.
3. **What should Zeke suggest?**
   ID: `zkm3-23-q1` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: What should Zeke suggest. Scene: During recess team time, Zeke listens while the group figures out next steps, poster project table (2-3).
   Choices: A. Let's pick jobs for each person **(correct)** · B. I will do everything myself · C. Nobody gets to help · D. Let's argue about the glue
   Explanation: Correct. Jobs help the team know what to do.
4. **Camp starts in 15 minutes. Caiden still needs to put on shoes and pack his folder. What should he do first?**
   ID: `cq3-23-q1` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. Do a one-minute readiness check first · B. Pack the folder and put on shoes **(correct)** · C. Pack one item, then continue prep · D. Delay until someone reminds him
   Explanation: With 15 minutes left, Caiden should handle what he needs before leaving.
5. **What was missing from the note?**
   ID: `mcl-23-q1` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a note with one word missing. The note said, "Meet by the ____ after lunch." She looked at the picture beside the note. It showed a tree. Miranda knew the missing word was tree.
   Choices: A. A word **(correct)** · B. A pencil · C. A backpack · D. A snack
   Explanation: One word in the note was blank.
6. **You feel nervous about trying a new activity. What is a brave choice?**
   ID: `b4m3-23-q2` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: You feel nervous about trying a new activity. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, helpful-choice practice pad (2-3).
   Choices: A. Try one small part of it **(correct)** · B. Quit before you start · C. Make fun of the activity · D. Wait for someone else to do everything
   Explanation: Yes. One small try is brave — you do not need zero nerves.
7. **The squeak happens right after someone opens a cabinet. What should Charlie notice?**
   ID: `cm3-23-q2` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: The squeak happens right after someone opens a cabinet. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, club interruption corner (2-3).
   Choices: A. The sound might be connected to the cabinet **(correct)** · B. The cabinet movement might be connected, so test it · C. Opening things is illegal in science club · D. The squeak only happens on Tuesdays in space
   Explanation: Good pattern spotting — the cabinet might be part of the mystery.
8. **Three kids want to draw. What job plan helps?**
   ID: `zkm3-23-q2` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: Three kids want to draw. Scene: During recess team time, Zeke listens while the group figures out next steps, group-plan clipboard (2-3).
   Choices: A. One draws, one writes title, one gathers supplies **(correct)** · B. All three draw the same letter at once · C. Split sections so each person has a role · D. Skip the poster and go to recess early
   Explanation: Yes. Different jobs use everyone's help.
9. **Caiden has 5 minutes before leaving. Which task fits best?**
   ID: `cq3-23-q2` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. Clean his whole room · B. Start a long movie · C. Fill his water bottle **(correct)** · D. Build a toy city
   Explanation: Filling a water bottle is a quick task that fits in 5 minutes.
10. **What picture helped Miranda?**
   ID: `mcl-23-q2` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a note with one word missing. The note said, "Meet by the ____ after lunch." She looked at the picture beside the note. It showed a tree. Miranda knew the missing word was tree.
   Choices: A. A tree **(correct)** · B. A chair · C. A shoe · D. A clock
   Explanation: The picture showed a tree, which helped Miranda know the missing word.

### 4-5 review set

Available: **21**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **A student is afraid to try because they might be wrong. What brave choice helps most?**
   ID: `b4m3-45-q1` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: A student is afraid to try because they might be wrong. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, brave choice console (4-5).
   Choices: A. Try one small step first **(correct)** · B. Quit before starting · C. Make fun of the activity · D. Wait for someone else to do it
   Explanation: Yes. A small step can unlock courage.
2. **Charlie hears the squeak every time the fan turns on. What does that tell him?**
   ID: `cm3-45-q1` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: Charlie hears the squeak every time the fan turns on. Scene: At the invention table, Charlie Perk compares two test results side by side, squeak hunt shelf (4-5).
   Choices: A. The fan may be connected to the sound **(correct)** · B. The sound loves science club · C. The floor is telling jokes · D. The fan is definitely innocent
   Explanation: Pattern found! The fan and the squeak may be linked.
3. **The group is stuck because everyone wants the same task. What is the best solution?**
   ID: `zkm3-45-q1` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: The group is stuck because everyone wants the same task. Scene: At the group project table, Zeke balances his idea with the team's plan, poster project table (4-5).
   Choices: A. Divide roles based on what the project needs **(correct)** · B. Use a quick team vote after hearing each idea · C. Stop working until the teacher fixes it · D. Make three people do the same job
   Explanation: Yes. Good teams match roles to the goal.
4. **Homework takes 20 minutes. Packing takes 5 minutes. The bus comes in 30 minutes. Can Caiden finish both?**
   ID: `cq3-45-q1` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. Yes, because 25 minutes is less than 30 **(correct)** · B. No, because 25 minutes is more than 30 · C. No, because homework takes all day · D. Yes, because time does not matter
   Explanation: 20 + 5 = 25 minutes, which fits inside the 30 minutes before the bus.
5. **What helped Miranda figure out the missing word?**
   ID: `mcl-45-q1` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a clue note on the floor. One word had been smudged: "Meet by the ____ after lunch." Next to the sentence was a small drawing of branches and leaves. Miranda compared the drawing to places around the school and realized the note probably pointed to the tree near the playground.
   Choices: A. The drawing of branches and leaves **(correct)** · B. A loud bell · C. A lunch tray · D. A classroom door
   Explanation: The drawing of branches and leaves pointed to a tree.
6. **A hard assignment makes a student want to avoid it completely. What brave choice fits?**
   ID: `b4m3-45-q2` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: A hard assignment makes a student want to avoid it completely. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, helpful-choice practice pad (4-5).
   Choices: A. Open the assignment and do the first small part **(correct)** · B. Wait and hope it feels easier later · C. Say homework is illegal · D. Wait until panic feels fun
   Explanation: Right. Starting small beats avoiding forever.
7. **The squeak only happens when the fan wobbles. What is Charlie tracking?**
   ID: `cm3-45-q2` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: The squeak only happens. Scene: At the invention table, Charlie Perk compares two test results side by side, club interruption corner (4-5).
   Choices: A. A pattern between movement and sound **(correct)** · B. Whether the fan or cabinet moved right before the squeak · C. Whether the same trigger happened each time · D. Whether ghosts prefer fans
   Explanation: Movement plus sound — that is pattern evidence.
8. **The poster needs a title, drawings, and facts. What should Zeke help the group do?**
   ID: `zkm3-45-q2` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: The poster needs a title, drawings, and facts. Scene: At the group project table, Zeke balances his idea with the team's plan, group-plan clipboard (4-5).
   Choices: A. Match each part to a job before anyone starts **(correct)** · B. Start drawing and argue later · C. Let one person redo everyone else's work · D. Copy another group's poster exactly
   Explanation: Correct. Planning roles first prevents the glitch from growing.
9. **Caiden has 30 minutes. Reading takes 15 minutes and cleaning takes 20 minutes. What should he notice?**
   ID: `cq3-45-q2` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. He has enough time for both · B. He needs 35 minutes for both **(correct)** · C. Reading takes 30 minutes · D. Cleaning takes 5 minutes
   Explanation: 15 + 20 = 35 minutes, which is more than the 30 he has.
10. **What does “smudged” mean?**
   ID: `mcl-45-q2` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda found a clue note on the floor. One word had been smudged: "Meet by the ____ after lunch." Next to the sentence was a small drawing of branches and leaves. Miranda compared the drawing to places around the school and realized the note probably pointed to the tree near the playground.
   Choices: A. Blurry or rubbed away **(correct)** · B. Very loud · C. Easy to hear · D. Carefully folded
   Explanation: Smudged means the word was hard to read because it was rubbed or blurry.

### 6-8 review set

Available: **21**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **A group is laughing at someone's mistake. What brave choice matches your values?**
   ID: `b4m3-68-q1` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: A group is laughing at someone's mistake. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, brave choice console (6-8).
   Choices: A. Redirect or support the person respectfully **(correct)** · B. Join in so you fit in · C. Stay silent even if it feels wrong · D. Record it for later
   Explanation: Correct. Brave choices often protect people, not popularity.
2. **What is the best evidence-based next step?**
   ID: `cm3-68-q1` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: What is the best evidence-based next step. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, squeak hunt shelf (6-8).
   Choices: A. Test whether the sound stops when **(correct)** · B. Test the likely source before concluding · C. Pause and notice one more detail first · D. Ask everyone to talk louder
   Explanation: Testing the pattern — that is how scientists confirm a cause.
3. **How can Zeke help without taking over?**
   ID: `zkm3-68-q1` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: How can Zeke help without taking over. Scene: Before a team captain huddle, Zeke reads the room and the roster, poster project table (6-8).
   Choices: A. Ask what needs to be done and help the group assign roles **(correct)** · B. Decide everyone's role without asking · C. Do all the important parts himself · D. Criticize the group for being messy
   Explanation: Correct. Zeke facilitates instead of controlling.
4. **Caiden has 90 minutes. Science takes 45, math takes 20, and reading takes 25. Can he complete all three?**
   ID: `cq3-68-q1` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. Yes, exactly 90 minutes **(correct)** · B. No, it takes 100 minutes · C. No, it takes 60 minutes · D. Yes, with 30 minutes left
   Explanation: 45 + 20 + 25 = 90 minutes — it fits exactly.
5. **Which clue most strongly supports the answer?**
   ID: `mcl-68-q1` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda discovered a clue note with a partially smudged location: "Meet by the ____ after lunch." Although the missing word was unreadable, a small sketch beside the sentence showed branches, leaves, and a curved trunk. Miranda used context clues from both the sentence and the drawing to infer that the intended meeting place was the old tree near the playground.
   Choices: A. The sketch of branches, leaves, and trunk **(correct)** · B. The word lunch · C. The note being on the floor · D. The sentence being short
   Explanation: The sketch directly suggests a tree as the meeting place.
6. **Friends pressure a student to copy answers on a quiz. What brave choice fits their values?**
   ID: `b4m3-68-q2` · Character: b4 · Module: `b4-brave-choice-button`
   Scene: Friends pressure a student to copy answers on a quiz. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, helpful-choice practice pad (6-8).
   Choices: A. Decline and do their own work **(correct)** · B. Copy quickly so nobody notices · C. Blame the teacher for making quizzes · D. Pretend the quiz is optional
   Explanation: Yes. Integrity under pressure is a real kind of bravery.
7. **Charlie turns off the fan and the squeak stops. What can he conclude?**
   ID: `cm3-68-q2` · Character: charlie · Module: `charlie-mystery-sound`
   Scene: Charlie turns off the fan and the squeak stops. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, club interruption corner (6-8).
   Choices: A. The fan was likely connected to the sound **(correct)** · B. The cabinet ghost took a break · C. The fan setup likely needs adjustment or maintenance · D. Patterns are not useful
   Explanation: When changing one thing stops the sound, you found a strong clue.
8. **Two teammates disagree about the layout. What facilitation move works?**
   ID: `zkm3-68-q2` · Character: zeke · Module: `zeke-group-project-glitch`
   Scene: Two teammates disagree about the layout. Scene: Before a team captain huddle, Zeke reads the room and the roster, group-plan clipboard (6-8).
   Choices: A. Help them name the goal and pick a solution together **(correct)** · B. Side with the louder person immediately · C. Rewrite the poster alone overnight · D. Tell them the project is ruined
   Explanation: Yes. Facilitation turns conflict into a shared decision.
9. **Caiden has 40 minutes before practice. He has a 30-minute assignment and needs 15 minutes to get ready. What should he do?**
   ID: `cq3-68-q2` · Character: caiden · Module: `quest-3`
   Scene:
   Choices: A. Do a short assignment chunk before the get-ready timer · B. Complete part of the assignment and set a timer to get ready **(correct)** · C. Ignore practice · D. Delay and hope he can rush both later
   Explanation: 45 minutes of work won't fit in 40 — he needs a plan with a timer for practice.
10. **What strategy did Miranda use?**
   ID: `mcl-68-q2` · Character: miranda · Module: `miranda-mystery-file-3`
   Scene: Miranda discovered a clue note with a partially smudged location: "Meet by the ____ after lunch." Although the missing word was unreadable, a small sketch beside the sentence showed branches, leaves, and a curved trunk. Miranda used context clues from both the sentence and the drawing to infer that the intended meeting place was the old tree near the playground.
   Choices: A. Context clues **(correct)** · B. Using one clue without checking others · C. Ignoring evidence · D. Asking everyone to stop
   Explanation: Miranda combined the sentence and drawing as context clues.

## Week 4 — Staying Present

Product focus: **Focus**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | Focus Reset Station (`b4-focus-reset-station`) | `src/data/b4/missions/mission4FocusResetStation.ts` | Your brain feels busy. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, focus reset station (K-1). / Your body feels wiggly and you cannot sit still. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, breathe-move-start panel (K-1). / A task feels hard to start. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, attention reset nook (K-1). | B-4 | Focus / Attention Reset |
| charlie | Volcano Trouble (`charlie-volcano-trouble`) | `src/data/charlie/missions/mission4VolcanoTrouble.ts` | Charlie builds a baking soda volcano, but the eruption is tiny. It gives one sad bubble and quits. Charlie refuses to let a volcano be this dramatic and boring. / Charlie's volcano made one tiny bubble. Is that a failure. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, tiny-eruption table (K-1). / Charlie wants a bigger reaction. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, bubble-test station (K-1). | Charlie | Problem Solving / Iteration |
| zeke | The Brave Voice (`zeke-brave-voice`) | `src/data/zeke/missions/mission4BraveVoice.ts` | What can Zeke say. Scene: In the cafeteria, Zeke pauses near a table with an open seat, hurt-joke hallway (K-1). / The hurt student looks sad. Scene: In the cafeteria, Zeke pauses near a table with an open seat, laugh-that-stings moment (K-1). / Zeke wants to help stop the joke. Scene: In the cafeteria, Zeke pauses near a table with an open seat, friendship repair step (K-1). | Zeke | Speaking Up Respectfully |
| caiden | Reset and Return (`quest-4`) | `src/data/caiden/questAdaptiveResetAndReturn.ts` | Caiden gets frustrated when his answer is wrong. His face feels hot. / Caiden notices his attention drifting during reading. / Caiden starts drawing during directions and misses the first step. | Caiden | Emotional Regulation, Planning, Executive Function, Consequence Evaluation, Tradeoffs |
| miranda | The Missing Letters (`the-missing-letters`) | `src/data/miranda/file3MissingLetters.ts` | Miranda found a note behind a poster. Some letters were missing. The note said, "Meet at the l_br_y after lunch." A picture of books helped Miranda know the word was library. / Miranda found a hidden m_ssage taped behind a poster. The smudged letters made the word hard to read. Beside the note was a drawing of an envelope with writing inside. Miranda compared the picture to the blank spaces and restored the word message. / Miranda examined a case file where several detective words had vanished. One entry read, "The witness gave a helpful d_scr_pt_on of the suspect." Nearby, Miranda's notes described someone's appearance in detail. She used the surrounding sentence and her notes to infer the missing word was description. | Miranda | Spelling, Word Building, Context Clues, Reading Comprehension, Context Clues, Word Building, Spelling, Inference, Vocabulary, Analysis |

### K-1 review set

Available: **15**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **Your brain feels busy. What can help you focus again?**
   ID: `b4m4-k1-q1` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: Your brain feels busy. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, focus reset station (K-1).
   Choices: A. Take one slow breath **(correct)** · B. Wait and hope focus comes back on its own · C. Start with the first small part of the task · D. Rip up the page and stop trying
   Explanation: Yes. One slow breath can help your brain reset.
2. **What should Charlie do next?**
   ID: `cm4-k1-q1` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Charlie builds a baking soda volcano, but the eruption is tiny. It gives one sad bubble and quits. Charlie refuses to let a volcano be this dramatic and boring.
   Choices: A. Try again with help **(correct)** · B. Throw the volcano away · C. Do one small change and test again · D. Dump random supplies in at once
   Explanation: Yes! Scientists try again — especially with a grown-up nearby.
3. **What can Zeke say?**
   ID: `zkm4-k1-q1` · Character: zeke · Module: `zeke-brave-voice`
   Scene: What can Zeke say. Scene: In the cafeteria, Zeke pauses near a table with an open seat, hurt-joke hallway (K-1).
   Choices: A. Say something mean back · B. That was not kind **(correct)** · C. Take a breath, then use a calm voice · D. Pretend hurting words are funny
   Explanation: Yes. Zeke can use kind, brave words.
4. **What is a strong focus move?**
   ID: `cq4-k1-q1` · Character: caiden · Module: `quest-4`
   Scene: Caiden gets frustrated when his answer is wrong. His face feels hot.
   Choices: RIP. Rip the paper · BLAME. Blame someone else · BREATH. Take a breath and try again **(correct)** · QUIT. Quit the activity forever
   Explanation: A breath gives Caiden a moment to reset.
5. **According to the passage, what was wrong with the note?**
   ID: `mml-k1-q1` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda found a note behind a poster. Some letters were missing. The note said, "Meet at the l_br_y after lunch." A picture of books helped Miranda know the word was library.
   Choices: A. Some letters were missing **(correct)** · B. The whole note was gone · C. The poster fell down · D. Miranda lost her pencil
   Explanation: The passage says some letters were missing from the note.
6. **Your body feels wiggly and you cannot sit still. Which reset button fits?**
   ID: `b4m4-k1-q2` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: Your body feels wiggly and you cannot sit still. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, breathe-move-start panel (K-1).
   Choices: A. Move — a quick stretch or wiggle break **(correct)** · B. Breathe — hold your breath for ten minutes · C. Start Small — write the whole report now · D. Wait and hope focus returns later
   Explanation: Right. A short move can help wiggly energy settle.
7. **Charlie's volcano made one tiny bubble. Is that a failure?**
   ID: `cm4-k1-q2` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Charlie's volcano made one tiny bubble. Is that a failure. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, tiny-eruption table (K-1).
   Choices: A. No — it tells Charlie what to try next **(correct)** · B. No — one small result can still guide the next test · C. No — it means the setup needs a better next step · D. No — even tiny bubbles are useful evidence
   Explanation: Small results are still data. Charlie can learn from them.
8. **The hurt student looks sad. What kind move can Zeke make?**
   ID: `zkm4-k1-q2` · Character: zeke · Module: `zeke-brave-voice`
   Scene: The hurt student looks sad. Scene: In the cafeteria, Zeke pauses near a table with an open seat, laugh-that-stings moment (K-1).
   Choices: A. Check on them with a gentle "Are you okay?" **(correct)** · B. Point at them so everyone looks · C. Copy the mean joke · D. Walk past like nothing happened
   Explanation: Yes. A gentle check-in shows Zeke cares.
9. **What is the best focus reset?**
   ID: `cq4-k1-q2` · Character: caiden · Module: `quest-4`
   Scene: Caiden notices his attention drifting during reading.
   Choices: A. Take one breath and return to the sentence **(correct)** · B. Close the book forever · C. Talk loudly · D. Hide the book
   Explanation: One breath, then return to the sentence.
10. **Which clue best supports the missing word?**
   ID: `mml-k1-q2` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda found a note behind a poster. Some letters were missing. The note said, "Meet at the l_br_y after lunch." A picture of books helped Miranda know the word was library.
   Choices: A. A picture of books **(correct)** · B. A picture of a ball · C. A picture of a shoe · D. A picture of a clock
   Explanation: The picture of books points to the word library.

### 2-3 review set

Available: **15**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **A student keeps looking around the room. What reset could help?**
   ID: `b4m4-23-q1` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: A student keeps looking around the room. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, focus reset station (2-3).
   Choices: A. Look at the first question and start there **(correct)** · B. Try to finish everything at once · C. Watch everyone else · D. Complaining about the chair
   Explanation: Correct. Starting with one question makes focus easier.
2. **What is the smart way to improve the volcano?**
   ID: `cm4-23-q1` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: What is the smart way to improve the volcano. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, baking soda volcano bay (2-3).
   Choices: A. Change one ingredient amount at a time **(correct)** · B. Change everything at once · C. Stop measuring · D. Change one measured amount at a time
   Explanation: One change at a time — then Charlie knows what helped.
3. **What is a brave way to help?**
   ID: `zkm4-23-q1` · Character: zeke · Module: `zeke-brave-voice`
   Scene: What is a brave way to help. Scene: During recess team time, Zeke listens while the group figures out next steps, hurt-joke hallway (2-3).
   Choices: A. Say, "Let's not make fun of them." **(correct)** · B. Join the joke · C. Point and laugh · D. Pretend nobody got hurt
   Explanation: Correct. Zeke speaks up without attacking.
4. **Caiden gets a question wrong. What should he do next?**
   ID: `cq4-23-q1` · Character: caiden · Module: `quest-4`
   Scene:
   Choices: A. Take a short break and come back with a plan · B. Take a breath and try again **(correct)** · C. Wait and hope the feeling passes · D. Throw his pencil
   Explanation: A breath gives Caiden a moment to calm down before trying again.
5. **According to the passage, what did Miranda find behind the poster?**
   ID: `mml-23-q1` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda found a hidden m_ssage taped behind a poster. The smudged letters made the word hard to read. Beside the note was a drawing of an envelope with writing inside. Miranda compared the picture to the blank spaces and restored the word message.
   Choices: A. A hidden message with missing letters **(correct)** · B. A new backpack · C. A lunch tray · D. A broken pencil
   Explanation: Miranda found a hidden message with smudged, missing letters.
6. **Noise outside the window keeps pulling a student's attention away. What reset helps?**
   ID: `b4m4-23-q2` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: Noise outside the window keeps pulling a student's attention away. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, breathe-move-start panel (2-3).
   Choices: A. Stare out the window and wait for quiet · B. Take a breath and refocus on one task item **(correct)** · C. Do the easiest part first, then come back · D. Tear up the worksheet
   Explanation: Yes. Breathe, then aim at one small target.
7. **Charlie adds a little more vinegar and gets more bubbles. What should he do?**
   ID: `cm4-23-q2` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Charlie adds a little more vinegar and gets more bubbles. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, tiny-eruption table (2-3).
   Choices: A. Remember that change worked and try the next small tweak **(correct)** · B. Add every liquid in the room · C. Stop testing because one bubble is enough · D. Record the result and discuss the next test
   Explanation: Iteration means keep small improvements going.
8. **Some kids keep giggling. What can Zeke add?**
   ID: `zkm4-23-q2` · Character: zeke · Module: `zeke-brave-voice`
   Scene: Some kids keep giggling. Scene: During recess team time, Zeke listens while the group figures out next steps, laugh-that-stings moment (2-3).
   Choices: A. That joke is not okay. Let's talk about something else. **(correct)** · B. Keep laughing so he fits in · C. Make fun of the person who made the joke publicly · D. Run to the principal without saying anything first
   Explanation: Yes. Zeke stays brave and changes the direction.
9. **Caiden feels frustrated because his drawing is not perfect. What can help?**
   ID: `cq4-23-q2` · Character: caiden · Module: `quest-4`
   Scene:
   Choices: A. Rip it up · B. Take a short break **(correct)** · C. Say he is bad at art · D. Set it aside without choosing a next step
   Explanation: A short break lets strong feelings settle before Caiden continues.
10. **Which clue best supports the restored word?**
   ID: `mml-23-q2` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda found a hidden m_ssage taped behind a poster. The smudged letters made the word hard to read. Beside the note was a drawing of an envelope with writing inside. Miranda compared the picture to the blank spaces and restored the word message.
   Choices: A. The drawing of an envelope with writing inside **(correct)** · B. The poster color · C. The time of day · D. The hallway noise
   Explanation: The envelope drawing suggests someone wrote a message.

### 4-5 review set

Available: **15**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **A task feels too big, so the student avoids it. What should B-4 suggest?**
   ID: `b4m4-45-q1` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: A task feels too big, so the student avoids it. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, focus reset station (4-5).
   Choices: A. Break it into one small first step **(correct)** · B. Wait until it magically feels easy · C. Do the hardest part while panicking · D. Think about every task at once
   Explanation: Yes. A small first step reduces overwhelm.
2. **Why should Charlie measure the baking soda and vinegar?**
   ID: `cm4-45-q1` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Why should Charlie measure the baking soda and vinegar. Scene: At the invention table, Charlie Perk compares two test results side by side, baking soda volcano bay (4-5).
   Choices: A. So he can compare what works best **(correct)** · B. So he can repeat the same test later · C. So he can share clear results with teammates · D. So testing is no longer needed
   Explanation: Measurements turn guesses into useful comparisons.
3. **What should Zeke do if he wants to redirect the group?**
   ID: `zkm4-45-q1` · Character: zeke · Module: `zeke-brave-voice`
   Scene: What should Zeke do if he wants to redirect the group. Scene: At the group project table, Zeke balances his idea with the team's plan, hurt-joke hallway (4-5).
   Choices: A. Calmly say the joke is not okay and cha **(correct)** · B. Embarrass the person who made the joke · C. Pause and notice one more detail first · D. Pause and notice one more detail first
   Explanation: Yes. Redirecting can stop harm without making the room explode.
4. **Which recovery plan uses his break time best?**
   ID: `cq4-45-q1` · Character: caiden · Module: `quest-4`
   Scene: Caiden loses a team challenge and has 10 minutes before the next round. He can review what went wrong (6 min), practice one skill (8 min), or sit quietly and reset (4 min).
   Choices: A. Reset 4 minutes, then review 6 minutes — no time to practice **(correct)** · B. Skip reset and practice the full 8 minutes while still frustrated · C. Argue about the score for the whole break · D. Leave the activity and miss the next round
   Explanation: A short reset clears frustration, then review fits in the remaining time before the next round.
5. **According to the passage, what was missing from the case file?**
   ID: `mml-45-q1` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda examined a case file where several detective words had vanished. One entry read, "The witness gave a helpful d_scr_pt_on of the suspect." Nearby, Miranda's notes described someone's appearance in detail. She used the surrounding sentence and her notes to infer the missing word was description.
   Choices: A. Letters inside detective words **(correct)** · B. The whole case file · C. Miranda's badge · D. The suspect's name only
   Explanation: Several detective words had letters missing from inside them.
6. **A student's mind keeps wandering while reading. What reset strategy fits?**
   ID: `b4m4-45-q2` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: A student's mind keeps wandering while reading. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, breathe-move-start panel (4-5).
   Choices: A. Re-read one paragraph and summarize it **(correct)** · B. Read ten pages without noticing · C. Stop reading for today and skip the assignment · D. Read while doing five other things
   Explanation: Right. One paragraph is a focus-sized target.
7. **Test A: 1 spoon baking soda, small bubble. Test B: 2 spoons, bigger bubble. What did Charlie learn?**
   ID: `cm4-45-q2` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Test A: 1 spoon baking soda, small bubble. Test B: 2 spoons, bigger bubble. Scene: At the invention table, Charlie Perk compares two test results side by side, tiny-eruption table (4-5).
   Choices: A. More baking soda might improve the reaction **(correct)** · B. He should repeat the test to confirm the pattern · C. He may need to test vinegar next in a separate round · D. Amount changes can never affect bubbles
   Explanation: Comparing measured tests gives Charlie real data.
8. **The joke-maker says "It was just funny." What is a respectful reply?**
   ID: `zkm4-45-q2` · Character: zeke · Module: `zeke-brave-voice`
   Scene: The joke-maker says "It was just funny.". Scene: At the group project table, Zeke balances his idea with the team's plan, laugh-that-stings moment (4-5).
   Choices: A. Funny can still hurt someone. Let's stop. **(correct)** · B. That joke hurt someone; please stop · C. Fine, keep going then · D. Laugh harder to avoid conflict
   Explanation: Correct. Zeke names the harm without attacking the person.
9. **Caiden's teacher gives feedback on his comic. What should he do first?**
   ID: `cq4-45-q2` · Character: caiden · Module: `quest-4`
   Scene:
   Choices: A. Listen and look for one thing to improve **(correct)** · B. Throw it away · C. Say feedback is bad · D. Refuse to change anything
   Explanation: Listening for one improvement turns feedback into a next step.
10. **Which clue best supports the word description?**
   ID: `mml-45-q2` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda examined a case file where several detective words had vanished. One entry read, "The witness gave a helpful d_scr_pt_on of the suspect." Nearby, Miranda's notes described someone's appearance in detail. She used the surrounding sentence and her notes to infer the missing word was description.
   Choices: A. Notes about someone's appearance in detail **(correct)** · B. A drawing of a lunch table · C. A bell ringing · D. A closed classroom door
   Explanation: A description tells what someone looks like, matching Miranda's detail notes.

### 6-8 review set

Available: **15**. Review set: **10**. Status: **reviewed / staging runtime-active**.

1. **Why does a reset routine help attention?**
   ID: `b4m4-68-q1` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: Why does a reset routine help attention. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, focus reset station (6-8).
   Choices: A. It gives the brain a repeatable way to restart **(correct)** · B. It makes focus easier to restart when attention drifts · C. It replaces all effort · D. It makes distractions illegal
   Explanation: Exactly. A routine makes it easier to restart without arguing with your brain.
2. **Charlie wants a stronger eruption. What should he keep the same?**
   ID: `cm4-68-q1` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Charlie wants a stronger eruption. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, baking soda volcano bay (6-8).
   Choices: A. All variables except the one **(correct)** · B. Pause and notice one more detail first · C. Only the volcano name · D. The funniest guess
   Explanation: Control variables — change one, hold the rest steady.
3. **What response shows courage and social skill?**
   ID: `zkm4-68-q1` · Character: zeke · Module: `zeke-brave-voice`
   Scene: What response shows courage and social skill. Scene: Before a team captain huddle, Zeke reads the room and the roster, hurt-joke hallway (6-8).
   Choices: A. Name the harm respectfully and support the student **(correct)** · B. Publicly shame everyone involved · C. Stay silent because it is easier · D. Make a harsher joke back
   Explanation: Correct. Zeke challenges harm while keeping the situation from escalating.
4. **Caiden receives critical feedback on a project he worked hard on. What response shows emotional regulation?**
   ID: `cq4-68-q1` · Character: caiden · Module: `quest-4`
   Scene:
   Choices: A. He pauses, listens, and chooses one improvement **(correct)** · B. He argues immediately · C. He deletes the whole project · D. He refuses to participate
   Explanation: Pausing before responding helps Caiden use feedback productively.
5. **According to the passage, how did Miranda restore the words?**
   ID: `mml-68-q1` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda recovered a partially damaged investigation log. Key terms had missing letters: "The team will inv_st_g_te the disc_p_ncy between the two witness accounts." Although the letters were gone, Miranda noted that investigate means to examine closely and discrepancy means a difference that does not match. She used both context clues and word structure to restore the corrupted terms.
   Choices: A. She used context clues and word structure **(correct)** · B. She guessed without reading · C. She erased the whole log · D. She asked someone else to solve it
   Explanation: Miranda combined sentence context and word parts to restore the terms.
6. **A student feels overwhelmed by a long to-do list. What intentional reset fits?**
   ID: `b4m4-68-q2` · Character: b4 · Module: `b4-focus-reset-station`
   Scene: B-4's Focus Reset Station has three buttons: Breathe, Move, and Start Small. The learner needs to pick the right reset before jumping back in.
   Choices: A. Breathe, then pick the single most important first step **(correct)** · B. Try to finish the entire list in one panic sprint · C. Avoid the list until tomorrow's tomorrow · D. Add ten more tasks for fun
   Explanation: Yes. Breathe, prioritize, start small — that is a solid reset routine.
7. **Charlie tests more vinegar while keeping baking soda and cup size the same. What is he doing?**
   ID: `cm4-68-q2` · Character: charlie · Module: `charlie-volcano-trouble`
   Scene: Charlie tests more vinegar while keeping baking soda and cup size the same. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, tiny-eruption table (6-8).
   Choices: A. Testing one independent variable wh **(correct)** · B. Changing every variable at once · C. Avoiding measurement on purpose · D. Pause and notice one more detail first
   Explanation: That is controlled testing — one change, everything else fixed.
8. **The group gets tense after Zeke speaks up. What keeps dignity on both sides?**
   ID: `zkm4-68-q2` · Character: zeke · Module: `zeke-brave-voice`
   Scene: The group gets tense after Zeke speaks up. Scene: Before a team captain huddle, Zeke reads the room and the roster, laugh-that-stings moment (6-8).
   Choices: A. Stay calm and focus on the hurt, not attacking the joker **(correct)** · B. Keep arguing until someone cries · C. DARE people to keep joking · D. Threaten to expose everyone's secrets
   Explanation: Yes. Calm focus on harm beats public shaming.
9. **Why is pausing helpful when emotions are strong?**
   ID: `cq4-68-q2` · Character: caiden · Module: `quest-4`
   Scene:
   Choices: A. It gives the brain time to choose a better response **(correct)** · B. It makes problems vanish · C. It means feelings are wrong · D. It avoids responsibility
   Explanation: A pause creates space between feeling and reacting.
10. **Which clue best supports the word discrepancy?**
   ID: `mml-68-q2` · Character: miranda · Module: `the-missing-letters`
   Scene: Miranda recovered a partially damaged investigation log. Key terms had missing letters: "The team will inv_st_g_te the disc_p_ncy between the two witness accounts." Although the letters were gone, Miranda noted that investigate means to examine closely and discrepancy means a difference that does not match. She used both context clues and word structure to restore the corrupted terms.
   Choices: A. A difference between two witness accounts **(correct)** · B. A matching story from everyone · C. A single empty chair · D. A poster on the wall
   Explanation: A discrepancy is a mismatch, which fits two different witness accounts.

## Week 5 — Big Feelings

Product focus: **Emotional Awareness**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | Calm-Down Countdown (`b4-calm-down-countdown`) | `src/data/b4/missions/mission5CalmDownCountdown.ts` | What can B-4 do to calm a big feeling. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, calm-down countdown timer (K-1). / Your body feels wiggly and jumpy. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, big-feeling alert bell (K-1). / B-4 says "3… 2… 1… breathe.". Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, cool-down practice mat (K-1). | B-4 | Self-Regulation / Calming Strategies |
| charlie | The Missing Plant (`charlie-missing-plant`) | `src/data/charlie/missions/mission5MissingPlant.ts` | What does Charlie check first. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, twin plant window ledge (K-1). / One plant has dry soil. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, thriving-vs-wilt shelf (K-1). / Charlie waters the dry plant. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, leaf-check station (K-1). | Charlie | Cause and Effect |
| zeke | Friendship Repair (`zeke-friendship-repair`) | `src/data/zeke/missions/mission5FriendshipRepair.ts` | What should Zeke do first. Scene: In the cafeteria, Zeke pauses near a table with an open seat, saved-seat promise spot (K-1). / Zeke's friend is still quiet. Scene: In the cafeteria, Zeke pauses near a table with an open seat, quiet-upset bench (K-1). / What is repair. Scene: In the cafeteria, Zeke pauses near a table with an open seat, friendship fix table (K-1). | Zeke | Conflict Repair / Apology |
| caiden | Build the Plan (`quest-5`) | `src/data/caiden/questAdaptiveBuildThePlan.ts` | Caiden feels overwhelmed because his room is messy. / Caiden wants to finish a project before Friday. Today is Monday. / Caiden's science poster is due Friday. Research takes 40 minutes, drafting takes 30, and design takes 25. He has two 45-minute study blocks after school today and Wednesday. | Caiden | Planning & Organization, Sequencing, Planning, Scheduling |
| miranda | The Context Clue Challenge (`the-context-clue-challenge`) | `src/data/miranda/file4ContextClueChallenge.ts` | Miranda looked closely at the poster on the wall. She did not just glance. She examined every corner to find a hidden clue. / Miranda carefully examined the poster taped near the bulletin board. The clue seemed unusual because the drawing did not match anything she had seen before. She wrote in her notebook that unusual means different from what you expect. / The campers searched the room for evidence after the schedule disappeared. Miranda hesitated before opening a sealed envelope because she wanted to follow the rules. Her facilitator reminded her that evidence means proof or clues that help solve a mystery. | Miranda | Vocabulary, Context Clues, Inference, Context Clues, Vocabulary, Reading Comprehension, Inference, Analysis |

### K-1 review set

Available: **15**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **What can B-4 do to calm a big feeling?**
   ID: `b4m5-k1-q1` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: What can B-4 do to calm a big feeling. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, calm-down countdown timer (K-1).
   Choices: A. Count slowly and breathe **(correct)** · B. Make the feeling race · C. Say "go away" to the feeling · D. Knock over the chair
   Explanation: Yes. Counting and breathing can help the feeling slow down.
2. **What does Charlie check first?**
   ID: `cm5-k1-q1` · Character: charlie · Module: `charlie-missing-plant`
   Scene: What does Charlie check first. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, twin plant window ledge (K-1).
   Choices: A. If the plant got water and light **(correct)** · B. If the plant likes jokes · C. If the pencil is tired · D. If the wall is green
   Explanation: Good start! Plants need water and light to stay happy.
3. **What should Zeke do first?**
   ID: `zkm5-k1-q1` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: What should Zeke do first. Scene: In the cafeteria, Zeke pauses near a table with an open seat, saved-seat promise spot (K-1).
   Choices: A. Say sorry **(correct)** · B. Blame the chair · C. Say it does not matter · D. Walk away
   Explanation: Yes. Saying sorry is a good repair start.
4. **What is the best first step?**
   ID: `cq5-k1-q1` · Character: caiden · Module: `quest-5`
   Scene: Caiden feels overwhelmed because his room is messy.
   Choices: WHOLE. Clean the whole room at once · CLOTHES. Pick up the clothes first **(correct)** · BED. Throw everything under the bed · GIVEUP. Give up
   Explanation: Plans start with one small step.
5. **According to the passage, what did Miranda do to the poster?**
   ID: `mcc-k1-q1` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda looked closely at the poster on the wall. She did not just glance. She examined every corner to find a hidden clue.
   Choices: A. She looked at it closely **(correct)** · B. She tore it down · C. She ignored it · D. She painted it
   Explanation: Miranda examined every corner, which means she looked closely.
6. **Your body feels wiggly and jumpy. What can help?**
   ID: `b4m5-k1-q2` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: Your body feels wiggly and jumpy. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, big-feeling alert bell (K-1).
   Choices: A. Take slow breaths with B-4 **(correct)** · B. Run in circles faster · C. Hold your breath until you float · D. Shake your lunchbox at the wall
   Explanation: Nice. Slow breaths tell your body it can settle.
7. **One plant has dry soil. What might have happened?**
   ID: `cm5-k1-q2` · Character: charlie · Module: `charlie-missing-plant`
   Scene: One plant has dry soil. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, thriving-vs-wilt shelf (K-1).
   Choices: A. It did not get enough water **(correct)** · B. It ate too much lunch · C. It stayed up too late watching TV · D. It turned into a pencil
   Explanation: Dry soil is a clue — plants need water.
8. **Zeke's friend is still quiet. What helps next?**
   ID: `zkm5-k1-q2` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: Zeke's friend is still quiet. Scene: In the cafeteria, Zeke pauses near a table with an open seat, quiet-upset bench (K-1).
   Choices: A. Ask if they want to talk **(correct)** · B. Make a joke about seats · C. Ignore them and keep playing · D. Say they should not be upset
   Explanation: Nice. Zeke shows he cares by checking in.
9. **What should he do?**
   ID: `cq5-k1-q2` · Character: caiden · Module: `quest-5`
   Scene: Caiden wants to finish a project before Friday. Today is Monday.
   Choices: FRIDAY. Wait until Friday morning · PLAN. Make a small plan for each day **(correct)** · FORGET. Forget about it · FUN. Do only the fun parts
   Explanation: Small steps across the week make big projects easier.
10. **Which clue best supports what "examined" means?**
   ID: `mcc-k1-q2` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda looked closely at the poster on the wall. She did not just glance. She examined every corner to find a hidden clue.
   Choices: A. She looked at every corner **(correct)** · B. She ran away · C. She ate a snack · D. She closed her eyes
   Explanation: Looking at every corner shows examined means looked closely.

### 2-3 review set

Available: **15**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student feels upset and wants to yell. What should happen first?**
   ID: `b4m5-23-q1` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: A student feels upset and wants to yell. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, calm-down countdown timer (2-3).
   Choices: A. Wait and hope the feeling gets smaller · B. Calm the body before talking **(correct)** · C. Ask for help after one calming breath · D. Break something to show the feeling
   Explanation: Correct. The body needs calm before the words work well.
2. **One plant is near the window and one is in the dark corner. What should Charlie notice?**
   ID: `cm5-23-q1` · Character: charlie · Module: `charlie-missing-plant`
   Scene: One plant is near the window and one is in the dark corner. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, twin plant window ledge (2-3).
   Choices: A. Light may be making a difference **(correct)** · B. The dark corner is cooler at games · C. The window plant is showing off · D. The plants are racing
   Explanation: Light is a big clue when two plants started the same.
3. **What makes Zeke's apology better?**
   ID: `zkm5-23-q1` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: What makes Zeke's apology better. Scene: During recess team time, Zeke listens while the group figures out next steps, saved-seat promise spot (2-3).
   Choices: A. Listening to how his friend feels **(correct)** · B. Saying sorry while running away · C. Explaining why his friend should not care · D. Changing the subject fast
   Explanation: Correct. Listening helps repair the friendship.
4. **Caiden needs to pack for camp. What should he do first?**
   ID: `cq5-23-q1` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Make a list **(correct)** · B. Check the bag and list missing items · C. Watch TV · D. Forget everything
   Explanation: A list helps Caiden remember everything he needs to pack.
5. **According to the passage, why did the clue seem unusual?**
   ID: `mcc-23-q1` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda carefully examined the poster taped near the bulletin board. The clue seemed unusual because the drawing did not match anything she had seen before. She wrote in her notebook that unusual means different from what you expect.
   Choices: A. The drawing did not match anything Miranda had seen **(correct)** · B. The poster was the same as always · C. Miranda forgot her notebook · D. The bell had not rung yet
   Explanation: The clue stood out because the drawing was unfamiliar.
6. **Your hands are in tight fists. What calming tool might help?**
   ID: `b4m5-23-q2` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: Your hands are in tight fists. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, big-feeling alert bell (2-3).
   Choices: A. Squeeze your hands, then open them slowly **(correct)** · B. Take a breath, then slowly unclench your fingers · C. Wait and do nothing even if your body stays tight · D. Hit your desk to let feelings out
   Explanation: Good tool. Squeeze and release can help tight fists loosen.
7. **The happy plant gets watered on schedule. The sad one was skipped twice. What might be the cause?**
   ID: `cm5-23-q2` · Character: charlie · Module: `charlie-missing-plant`
   Scene: The happy plant gets watered on schedule. The sad one was skipped twice. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, thriving-vs-wilt shelf (2-3).
   Choices: A. The plant by the window might have extra light too · B. Missing water could be hurting the sad plant **(correct)** · C. Both water and light should be checked one at a time · D. Plant health is always random
   Explanation: Cause and effect — less water can lead to a wilted plant.
8. **Zeke says sorry but keeps playing his game. What is missing?**
   ID: `zkm5-23-q2` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: Zeke says sorry but keeps playing his game. Scene: During recess team time, Zeke listens while the group figures out next steps, quiet-upset bench (2-3).
   Choices: A. Really listening to his friend **(correct)** · B. Saying sorry louder · C. Buying a new chair · D. Walking away faster
   Explanation: Yes. Sorry plus listening shows Zeke cares.
9. **Which item belongs in a camp bag?**
   ID: `cq5-23-q2` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Water bottle **(correct)** · B. Pillow from bed · C. TV remote · D. A random extra with no plan
   Explanation: A water bottle is a practical camp essential.
10. **Which clue best supports what "unusual" means?**
   ID: `mcc-23-q2` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda carefully examined the poster taped near the bulletin board. The clue seemed unusual because the drawing did not match anything she had seen before. She wrote in her notebook that unusual means different from what you expect.
   Choices: A. Different from what you expect **(correct)** · B. Easy to carry · C. Very loud · D. Already solved
   Explanation: Miranda wrote that unusual means different from what you expect.

### 4-5 review set

Available: **15**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **Why is it helpful to pause before responding?**
   ID: `b4m5-45-q1` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: Why is it helpful to pause before responding. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, calm-down countdown timer (4-5).
   Choices: A. It gives the thinking brain time to come back online **(correct)** · B. It makes the other person lose · C. It helps the feeling shrink so you can think · D. It helps you respond, not react
   Explanation: Yes. Pausing gives your brain more control over the next choice.
2. **What evidence helps Charlie explain the wilted plant?**
   ID: `cm5-45-q1` · Character: charlie · Module: `charlie-missing-plant`
   Scene: What evidence helps Charlie explain the wilted plant. Scene: At the invention table, Charlie Perk compares two test results side by side, twin plant window ledge (4-5).
   Choices: A. Differences in water, light, or soil **(correct)** · B. The plant's favorite song · C. Charlie's lunch choice · D. The color of the desk
   Explanation: Environmental differences are real cause-and-effect clues.
3. **What should Zeke say?**
   ID: `zkm5-45-q1` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: What should Zeke say. Scene: At the group project table, Zeke balances his idea with the team's plan, saved-seat promise spot (4-5).
   Choices: A. I said I would save you a seat, and I did not. I'm sorry. **(correct)** · B. You are too sensitive · C. I forgot, so it does not count · D. Other people made me do it
   Explanation: Yes. Zeke owns the specific mistake.
4. **Caiden is making a comic. What should happen first?**
   ID: `cq5-45-q1` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Print copies · B. Write the story idea **(correct)** · C. Sell it · D. Color the final page first
   Explanation: Every comic starts with a story idea before art or printing.
5. **According to the passage, what were the campers searching for?**
   ID: `mcc-45-q1` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: The campers searched the room for evidence after the schedule disappeared. Miranda hesitated before opening a sealed envelope because she wanted to follow the rules. Her facilitator reminded her that evidence means proof or clues that help solve a mystery.
   Choices: A. Evidence **(correct)** · B. Lunch menus · C. New shoes · D. Art supplies only
   Explanation: The campers searched the room for evidence after the schedule disappeared.
6. **A text message makes you angry. What is the best first move?**
   ID: `b4m5-45-q2` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: A text message makes you angry. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, big-feeling alert bell (4-5).
   Choices: A. Put the phone down and pause **(correct)** · B. Reply immediately while mad · C. Send ten angry messages · D. Put the phone down and take a short reset break
   Explanation: Smart pause. Your brain catches up when you step back.
7. **The wilted plant's soil is dry AND it sits in shade. What should Charlie do first?**
   ID: `cm5-45-q2` · Character: charlie · Module: `charlie-missing-plant`
   Scene: The wilted plant's soil is dry AND it sits in shade. Scene: At the invention table, Charlie Perk compares two test results side by side, thriving-vs-wilt shelf (4-5).
   Choices: A. Test one change at a time — water OR light **(correct)** · B. Change water, light, soil, and pot all at once · C. Decide the plant is hopeless · D. Only measure desk height
   Explanation: Two possible causes means test one fix at a time.
8. **A friend is upset because Zeke broke a promise. What matters most?**
   ID: `zkm5-45-q2` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: A friend is upset because Zeke broke a promise. Scene: At the group project table, Zeke balances his idea with the team's plan, quiet-upset bench (4-5).
   Choices: A. Owning what he did not do **(correct)** · B. Explaining why promises do not count · C. Blaming the busy schedule · D. Expecting instant forgiveness
   Explanation: Yes. Owning the mistake is the heart of repair.
9. **Caiden has three tasks: outline story, sketch panels, add color. What is the best order?**
   ID: `cq5-45-q2` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Color, sketch, outline · B. Outline, sketch, color **(correct)** · C. Sketch, color, outline · D. Sell, color, outline
   Explanation: Outline first, then sketch, then color — each step builds on the last.
10. **Which clue best supports what "evidence" means?**
   ID: `mcc-45-q2` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: The campers searched the room for evidence after the schedule disappeared. Miranda hesitated before opening a sealed envelope because she wanted to follow the rules. Her facilitator reminded her that evidence means proof or clues that help solve a mystery.
   Choices: A. Proof or clues that help solve a mystery **(correct)** · B. A reward for finishing early · C. A type of backpack · D. A classroom rule
   Explanation: The facilitator defined evidence as proof or clues for solving a mystery.

### 6-8 review set

Available: **15**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student is too frustrated to hear feedback. What is the best first step?**
   ID: `b4m5-68-q1` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: B-4 starts a calm-down countdown after a big feeling alert. The mission is to choose what helps the body calm before making the next choice.
   Choices: A. Regulate before discussing the problem **(correct)** · B. Keep explaining until they agree · C. Correct them in front of everyone · D. Tell them feelings do not matter
   Explanation: Correct. Regulation opens the door to learning.
2. **What is the best investigation plan?**
   ID: `cm5-68-q1` · Character: charlie · Module: `charlie-missing-plant`
   Scene: What is the best investigation plan. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, twin plant window ledge (6-8).
   Choices: A. Compare environmental conditions and change on **(correct)** · B. Keep one plant as a comparison while testing one change · C. Collect data before deciding the cause · D. Stop observing after one day
   Explanation: Systematic comparison — that is strong cause-and-effect science.
3. **How can Zeke rebuild trust?**
   ID: `zkm5-68-q1` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: How can Zeke rebuild trust. Scene: Before a team captain huddle, Zeke reads the room and the roster, saved-seat promise spot (6-8).
   Choices: A. Own the mistake, listen, and follow through differently next time **(correct)** · B. Expect forgiveness immediately · C. Avoid the friend until it disappears · D. Make a joke instead of addressing it
   Explanation: Correct. Trust rebuilds through repeated reliable actions.
4. **Caiden is preparing a presentation. Which plan is strongest?**
   ID: `cq5-68-q1` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Research, outline, create slides, practice **(correct)** · B. Create slides, guess facts, present · C. Practice before knowing the topic · D. Wait until the morning it is due
   Explanation: Research and outline come before slides and practice.
5. **According to the passage, what made Miranda scrutinize the details?**
   ID: `mcc-68-q1` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda reviewed a case summary where the suspect's alibi seemed plausible at first. However, one witness contradicted the timeline, and Miranda had to scrutinize each detail before drawing a conclusion. She noted that plausible means believable and contradict means to say the opposite.
   Choices: A. A witness contradicted the timeline **(correct)** · B. The case was already closed · C. Miranda lost her notebook · D. No one gave any information
   Explanation: The conflicting witness account made Miranda examine each detail carefully.
6. **A group project conflict starts while everyone is stressed. What first?**
   ID: `b4m5-68-q2` · Character: b4 · Module: `b4-calm-down-countdown`
   Scene: A group project conflict starts while everyone is stressed. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, big-feeling alert bell (6-8).
   Choices: A. Take a short break so everyone can regulate **(correct)** · B. Argue louder until someone wins · C. Assign blame and keep working · D. Quit the project immediately
   Explanation: Yes. Regulated brains solve problems better than fired-up ones.
7. **Charlie records light hours, water amount, and soil moisture for both plants. Why?**
   ID: `cm5-68-q2` · Character: charlie · Module: `charlie-missing-plant`
   Scene: Charlie records light hours, water amount, and soil moisture for both plants. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, thriving-vs-wilt shelf (6-8).
   Choices: A. To compare conditions and spot wh **(correct)** · B. To write a plant report card · C. To prove plants have opinions · D. To avoid testing anything
   Explanation: Data comparison reveals which factor likely caused the wilt.
8. **Zeke apologized but made the same mistake again. What does trust need now?**
   ID: `zkm5-68-q2` · Character: zeke · Module: `zeke-friendship-repair`
   Scene: Zeke apologized but made the same mistake again. Scene: Before a team captain huddle, Zeke reads the room and the roster, quiet-upset bench (6-8).
   Choices: A. Consistent follow-through over time **(correct)** · B. A louder apology · C. Time alone until they forget · D. A joke to lighten the mood
   Explanation: Yes. Trust grows when actions match words.
9. **Caiden is designing a game idea. What should happen first?**
   ID: `cq5-68-q2` · Character: caiden · Module: `quest-5`
   Scene:
   Choices: A. Launch the final game · B. Create a plan or wireframe **(correct)** · C. Sell merchandise · D. Ignore feedback
   Explanation: A plan or wireframe maps the idea before building or selling.
10. **Which clue best supports what "plausible" means?**
   ID: `mcc-68-q2` · Character: miranda · Module: `the-context-clue-challenge`
   Scene: Miranda reviewed a case summary where the suspect's alibi seemed plausible at first. However, one witness contradicted the timeline, and Miranda had to scrutinize each detail before drawing a conclusion. She noted that plausible means believable and contradict means to say the opposite.
   Choices: A. Believable at first **(correct)** · B. Completely impossible · C. Hidden under a table · D. Written in another language
   Explanation: Miranda noted that plausible means believable, which fits the alibi at first.

## Week 6 — Brave Choices

Product focus: **Decision Making**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | Oops Repair Lab (`b4-oops-repair-lab`) | `src/data/b4/missions/mission6OopsRepairLab.ts` | You knocked over someone's blocks. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, oops repair lab bench (K-1). / You spilled juice on a friend's paper. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, mistake-fix worktable (K-1). / What is repair. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, repair toolkit shelf (K-1). | B-4 | Repair / Accountability |
| charlie | Robot Rescue (`charlie-robot-rescue`) | `src/data/charlie/missions/mission6RobotRescue.ts` | Charlie's mini robot keeps spinning in circles instead of driving forward. Charlie says, "Okay, tiny tornado, let's debug your life choices." / Charlie checks the wheels. One looks loose. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, spin-fix workbench (K-1). / After fixing the wheel, the robot goes straight. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, tiny-driver track (K-1). | Charlie | Debugging |
| zeke | The Courage Challenge (`zeke-courage-challenge`) | `src/data/zeke/missions/mission6CourageChallenge.ts` | What brave step can Zeke take. Scene: In the cafeteria, Zeke pauses near a table with an open seat, talent signup sheet (K-1). / Zeke's stomach feels flip-floppy. Scene: In the cafeteria, Zeke pauses near a table with an open seat, flippy-stomach stage door (K-1). / What is one tiny brave step. Scene: In the cafeteria, Zeke pauses near a table with an open seat, tryout courage corner (K-1). | Zeke | Trying Something New / Confidence |
| caiden | The Snack Shop Challenge (`quest-6`) | `src/data/caiden/questAdaptiveSnackShopChallenge.ts` | Caiden has 5 camp tokens. A fruit cup costs 3 tokens. / The snack shop has water and a giant glow sticker. Caiden is thirsty after hiking. / Caiden has 4 tokens. Juice costs 2 and a cookie costs 2. | Caiden, B-4 | Planning, Planning & Budgeting |
| miranda | Miranda's Detective Notebook (`mirandas-detective-notebook`) | `src/data/miranda/file5DetectiveNotebook.ts` | Miranda found muddy footprints near the gym. The footprints led to the library. Under a table, she found a clue taped to the wood. / Miranda spotted muddy footprints near the gym door. She followed the trail down the hallway until the prints stopped outside the library. Inside, she knelt beneath a reading table and found a folded note taped to the underside. The note said the missing schedule was hidden for a team-building surprise. / Miranda documented a trail of muddy footprints that began near the gym and continued in a straight path toward the library. The depth of the prints suggested someone had walked quickly while carrying something. Beneath a library table, she recovered a note explaining that the schedule had been moved temporarily for a planned surprise activity. | Miranda | Comprehension, Inference, Critical Thinking, Reading Comprehension, Inference, Evidence, Comprehension, Critical Thinking, Vocabulary, Context Clues |

### K-1 review set

Available: **20**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **You knocked over someone's blocks. What helps repair it?**
   ID: `b4m6-k1-q1` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: You knocked over someone's blocks. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, oops repair lab bench (K-1).
   Choices: A. Say sorry and help rebuild **(correct)** · B. Wait and hope someone else fixes it · C. Say the blocks jumped · D. Laugh at the mess
   Explanation: Yes. Repair means helping fix what happened.
2. **What should Charlie check first?**
   ID: `cm6-k1-q1` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Charlie's mini robot keeps spinning in circles instead of driving forward. Charlie says, "Okay, tiny tornado, let's debug your life choices."
   Choices: A. One robot part at a time **(correct)** · B. Shake the robot · C. Call it a spaghetti machine · D. Check battery connection after checking wheels
   Explanation: One part at a time — that is how Charlie finds the problem.
3. **What brave step can Zeke take?**
   ID: `zkm6-k1-q1` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: What brave step can Zeke take. Scene: In the cafeteria, Zeke pauses near a table with an open seat, talent signup sheet (K-1).
   Choices: A. Put his name on the signup sheet **(correct)** · B. Tear the paper down · C. Take one breath and ask for support · D. Say nobody should try
   Explanation: Yes. Signing up can be a brave first step.
4. **How many tokens will he have left after buying the fruit cup?**
   ID: `cq6-k1-q1` · Character: caiden · Module: `quest-6`
   Scene: Caiden has 5 camp tokens. A fruit cup costs 3 tokens.
   Choices: A. 2 tokens **(correct)** · B. 5 tokens · C. 8 tokens · D. 0 tokens
   Explanation: 5 minus 3 equals 2 tokens left.
5. **According to the passage, where did Miranda find footprints?**
   ID: `mdn-k1-q1` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda found muddy footprints near the gym. The footprints led to the library. Under a table, she found a clue taped to the wood.
   Choices: A. Near the gym **(correct)** · B. On the bus · C. In the cafeteria · D. On the playground slide
   Explanation: The passage says Miranda found muddy footprints near the gym.
6. **You spilled juice on a friend's paper. What helps?**
   ID: `b4m6-k1-q2` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: You spilled juice on a friend's paper. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, mistake-fix worktable (K-1).
   Choices: A. Say sorry and help clean up **(correct)** · B. Say nothing and hope nobody notices · C. Say the juice was thirsty · D. Walk away really fast
   Explanation: Good repair. Sorry plus help shows you care.
7. **Charlie checks the wheels. One looks loose. What should he do?**
   ID: `cm6-k1-q2` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Charlie checks the wheels. One looks loose. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, spin-fix workbench (K-1).
   Choices: A. Ask a grown-up to help tighten it safely **(correct)** · B. Pull the wheel off completely · C. Ignore it and spin faster · D. Paint the wheel a new color
   Explanation: Found a clue! Get help to fix it safely.
8. **Zeke's stomach feels flip-floppy. What can he do?**
   ID: `zkm6-k1-q2` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: Zeke's stomach feels flip-floppy. Scene: In the cafeteria, Zeke pauses near a table with an open seat, flippy-stomach stage door (K-1).
   Choices: A. Wait and hope the nerves fade · B. Take one slow breath and think **(correct)** · C. Ask a friend to stand with him at signup · D. Rip up the signup sheet
   Explanation: Nice. A breath can help Zeke take the next step.
9. **What should Caiden buy first?**
   ID: `cq6-k1-q2` · Character: caiden · Module: `quest-6`
   Scene: The snack shop has water and a giant glow sticker. Caiden is thirsty after hiking.
   Choices: A. Water **(correct)** · B. Glow sticker · C. Both right now · D. Nothing at all
   Explanation: Water is a need when you are thirsty. Stickers can wait.
10. **Which clue best supports where Miranda went next?**
   ID: `mdn-k1-q2` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda found muddy footprints near the gym. The footprints led to the library. Under a table, she found a clue taped to the wood.
   Choices: A. The footprints led to the library **(correct)** · B. Miranda ate lunch · C. The gym door was locked · D. A bell rang
   Explanation: The footprints pointing to the library show where Miranda followed the trail.

### 2-3 review set

Available: **20**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student says something unkind. What should they do next?**
   ID: `b4m6-23-q1` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: A student says something unkind. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, oops repair lab bench (2-3).
   Choices: A. Own it and apologize **(correct)** · B. Pretend nobody heard · C. Say "just kidding" and walk away · D. Blame the chair
   Explanation: Correct. Owning the mistake helps rebuild trust.
2. **Why should Charlie test one fix at a time?**
   ID: `cm6-23-q1` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Why should Charlie test one fix at a time. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, mini robot test lane (2-3).
   Choices: A. So he knows which fix worked **(correct)** · B. So he can compare results across each fix · C. So he can guess faster · D. So the wheels get dizzy
   Explanation: One fix at a time = clear receipts for what worked.
3. **What helps Zeke feel more ready?**
   ID: `zkm6-23-q1` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: What helps Zeke feel more ready. Scene: During recess team time, Zeke listens while the group figures out next steps, talent signup sheet (2-3).
   Choices: A. Practice once with someone he trusts **(correct)** · B. Think of one practice step and schedule it · C. Tell everyone he is already perfect · D. Quit before trying
   Explanation: Correct. Practice makes brave choices easier.
4. **What should he do first?**
   ID: `cq6-23-q1` · Character: caiden · Module: `quest-6`
   Scene: Caiden has 12 tokens for snack shop day. He wants trail mix (7) and a drink (5).
   Choices: A. Add the prices before buying **(correct)** · B. Check total and compare with his token limit · C. List need vs want before paying · D. Buy first and hope the total works out
   Explanation: 7 plus 5 is 12 — exactly his budget, but adding first prevents surprises.
5. **According to the passage, where did the footprints stop?**
   ID: `mdn-23-q1` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda spotted muddy footprints near the gym door. She followed the trail down the hallway until the prints stopped outside the library. Inside, she knelt beneath a reading table and found a folded note taped to the underside. The note said the missing schedule was hidden for a team-building surprise.
   Choices: A. Outside the library **(correct)** · B. Inside the gym closet · C. On the playground · D. At the bus stop
   Explanation: The prints stopped outside the library before Miranda went inside.
6. **You accidentally cut in line. What should you do?**
   ID: `b4m6-23-q2` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: You accidentally cut in line. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, mistake-fix worktable (2-3).
   Choices: A. Say sorry and go to the back **(correct)** · B. Act like you were there first · C. Stand still and say nothing · D. Blame the person behind you
   Explanation: Good repair. Owning it shows you respect others.
7. **Charlie swaps the left and right wheel cables. The robot still spins. What did he learn?**
   ID: `cm6-23-q2` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Charlie swaps the left and right wheel cables. The robot still spins. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, spin-fix workbench (2-3).
   Choices: A. That fix did not solve the problem **(correct)** · B. That cable swap alone was not the root issue · C. He should test the next likely cause · D. Debugging is useless
   Explanation: A fix that does not work is still useful data.
8. **Zeke feels nervous before the talent show. What helps?**
   ID: `zkm6-23-q2` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: Zeke feels nervous before the talent show. Scene: During recess team time, Zeke listens while the group figures out next steps, flippy-stomach stage door (2-3).
   Choices: A. Practicing with a trusted friend **(correct)** · B. Planning a short practice with a trusted person · C. Telling everyone he is perfect · D. Quitting before trying
   Explanation: Yes. Practice builds confidence for the real try.
9. **Which choice shows good planning?**
   ID: `cq6-23-q2` · Character: caiden · Module: `quest-6`
   Scene: Two snacks cost the same: apple slices (4) or granola bar (4).
   Choices: A. Pick the one that fuels his hike **(correct)** · B. Buy both blindly · C. Choose the loudest package · D. Flip a coin in the air
   Explanation: Thinking about what he needs for the hike is smart planning.
10. **Which clue best supports why Miranda knelt under the table?**
   ID: `mdn-23-q2` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda spotted muddy footprints near the gym door. She followed the trail down the hallway until the prints stopped outside the library. Inside, she knelt beneath a reading table and found a folded note taped to the underside. The note said the missing schedule was hidden for a team-building surprise.
   Choices: A. She was searching for a hidden note **(correct)** · B. She dropped her pencil · C. She wanted to take a nap · D. She was hiding from a friend
   Explanation: Miranda searched beneath the table and found a folded note taped there.

### 4-5 review set

Available: **20**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **What makes an apology stronger?**
   ID: `b4m6-45-q1` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: What makes an apology stronger. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, oops repair lab bench (4-5).
   Choices: A. A specific action to repair the harm **(correct)** · B. Saying it as fast as possible · C. Making the other person apologize too · D. Explaining why it was not a big deal
   Explanation: Yes. Strong repair includes what you will do differently.
2. **The robot turns right when both wheels should move forward. What should Charlie inspect?**
   ID: `cm6-45-q1` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: The robot turns right. Scene: At the invention table, Charlie Perk compares two test results side by side, mini robot test lane (4-5).
   Choices: A. The wheel or motor connection **(correct)** · B. The classroom clock · C. The color of the robot · D. The snack table
   Explanation: Spinning often means one wheel or motor is not cooperating.
3. **Zeke feels nervous but still wants to try. What should he remember?**
   ID: `zkm6-45-q1` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: Zeke feels nervous but still wants to try. Scene: At the group project table, Zeke balances his idea with the team's plan, talent signup sheet (4-5).
   Choices: A. Nervous does not mean stop **(correct)** · B. Nervous means he will fail · C. Brave people can feel nervous and still act · D. He should only try easy things
   Explanation: Yes. Nervous feelings can come with brave choices.
4. **Which plan fits his budget?**
   ID: `cq6-45-q1` · Character: caiden · Module: `quest-6`
   Scene: Caiden has 20 tokens. He wants a sandwich (8), smoothie (6), and souvenir pen (9).
   Choices: A. Sandwich + smoothie = 14, save 6 **(correct)** · B. All three items = 23 · C. Buy pen twice · D. Spend 20 on one sticker
   Explanation: Sandwich and smoothie total 14, leaving room to save.
5. **According to the passage, what did the depth of the prints suggest?**
   ID: `mdn-45-q1` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda documented a trail of muddy footprints that began near the gym and continued in a straight path toward the library. The depth of the prints suggested someone had walked quickly while carrying something. Beneath a library table, she recovered a note explaining that the schedule had been moved temporarily for a planned surprise activity.
   Choices: A. Someone walked quickly while carrying something **(correct)** · B. Nobody had been in the hallway · C. The gym floor was dry · D. The library was empty all day
   Explanation: Deeper prints can mean quicker steps and extra weight from carrying an item.
6. **You borrowed something without asking and broke it. Best repair?**
   ID: `b4m6-45-q2` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: You borrowed something without asking and broke it. Best repair. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, mistake-fix worktable (4-5).
   Choices: A. Tell them, apologize, and offer to replace or fix it **(correct)** · B. Put it away and avoid talking about it · C. Say it was already broken when you found it · D. Wait and hope they forget
   Explanation: Strong repair. Honesty plus action rebuilds trust.
7. **Charlie notices the right motor wire is unplugged. What is the likely cause?**
   ID: `cm6-45-q2` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Charlie notices the right motor wire is unplugged. Scene: At the invention table, Charlie Perk compares two test results side by side, spin-fix workbench (4-5).
   Choices: A. Only the left motor is getting power, so the robot turns **(correct)** · B. One side likely has weaker power or connection · C. Motors work better when unplugged · D. The wire is decorative
   Explanation: One motor running and one not — classic spin cause.
8. **Zeke's hands are shaky before signup. What is a helpful move?**
   ID: `zkm6-45-q2` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: Zeke's hands are shaky before signup. Scene: At the group project table, Zeke balances his idea with the team's plan, flippy-stomach stage door (4-5).
   Choices: A. Breathe and take the one step anyway **(correct)** · B. Wait until fear disappears · C. Pretend he does not care · D. Only do things that feel easy
   Explanation: Yes. Zeke can move forward even with shaky hands.
9. **What does comparison shopping show?**
   ID: `cq6-45-q2` · Character: caiden · Module: `quest-6`
   Scene: Store A: trail mix 7 tokens. Store B: trail mix 5 tokens, same size.
   Choices: A. Store B saves 2 tokens **(correct)** · B. Prices never matter · C. Always pick Store A · D. Buy from both stores
   Explanation: The same item for fewer tokens is a better value.
10. **Which clue best supports that the schedule was not stolen?**
   ID: `mdn-45-q2` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda documented a trail of muddy footprints that began near the gym and continued in a straight path toward the library. The depth of the prints suggested someone had walked quickly while carrying something. Beneath a library table, she recovered a note explaining that the schedule had been moved temporarily for a planned surprise activity.
   Choices: A. A note said it was moved for a planned surprise **(correct)** · B. The footprints disappeared completely · C. Miranda found no note at all · D. The gym door was broken
   Explanation: The note explains a temporary move for a surprise, not theft.

### 6-8 review set

Available: **20**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **Why is accountability different from shame?**
   ID: `b4m6-68-q1` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: Why is accountability different from shame. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, oops repair lab bench (6-8).
   Choices: A. Accountability focuses on repair and better choices **(correct)** · B. Accountability means you are a bad person · C. Pressure and blame usually build trust · D. Repair is only needed if adults notice
   Explanation: Correct. Accountability helps you grow without attacking who you are.
2. **What is the strongest debugging process?**
   ID: `cm6-68-q1` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: What is the strongest debugging process. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, mini robot test lane (6-8).
   Choices: A. Identify the problem, test one cause, observe the result **(correct)** · B. Change five things and hope · C. Restart once, then verify one component at a time · D. Use observations instead of assumptions
   Explanation: Systematic debugging — identify, test one cause, observe.
3. **What shows real courage?**
   ID: `zkm6-68-q1` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: What shows real courage. Scene: Before a team captain huddle, Zeke reads the room and the roster, talent signup sheet (6-8).
   Choices: A. Taking a value-based step even while nervous **(correct)** · B. Choosing a small value-based step now · C. Acting like nothing matters · D. Avoiding anything with risk
   Explanation: Correct. Courage is action guided by values, not the absence of fear.
4. **Which option leaves more tokens saved?**
   ID: `cq6-68-q1` · Character: caiden · Module: `quest-6`
   Scene: Caiden has 30 tokens. Option A: 3 small snacks (8 each). Option B: one meal deal (18) plus drink (5).
   Choices: A. Meal deal + drink = 23, saves 7 **(correct)** · B. Three snacks = 24, saves 6 · C. Both save the same · D. Neither costs tokens
   Explanation: 18 + 5 = 23 leaves 7 tokens; three snacks cost 24 and save 6.
5. **According to the passage, what did the trail's straight path suggest?**
   ID: `mdn-68-q1` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda analyzed a sequence of muddy footprints leading from the gym to the library. The trail's straight path and deep impressions suggested purposeful movement rather than random wandering. After recovering a note beneath a reading table, she inferred that the missing schedule had been relocated intentionally for a team-building surprise, not removed because of a problem.
   Choices: A. Purposeful movement toward one destination **(correct)** · B. Random wandering with no goal · C. That no one had walked there · D. That the gym had flooded
   Explanation: A straight path toward the library suggests someone moved with a clear purpose.
6. **You posted something hurtful online. What is the best repair?**
   ID: `b4m6-68-q2` · Character: b4 · Module: `b4-oops-repair-lab`
   Scene: You posted something hurtful online. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, mistake-fix worktable (6-8).
   Choices: A. Delete it, apologize privately, and make amends **(correct)** · B. Like your own post so it looks popular · C. Say "it was just a joke" in the comments · D. Block everyone who was upset
   Explanation: Strong repair. Remove harm, own it, and make it right.
7. **Charlie's robot spins left. He checks: power, wheel connection, motor wire, and code. Which order is best?**
   ID: `cm6-68-q2` · Character: charlie · Module: `charlie-robot-rescue`
   Scene: Charlie's robot spins left. He checks: power, wheel connection, motor wire, and code. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, spin-fix workbench (6-8).
   Choices: A. Start with simple physical checks before changing code **(correct)** · B. Change code first, ignore hardware · C. Check everything randomly · D. Check known failure points before less likely causes
   Explanation: Start simple — loose wires beat rewriting code.
8. **Zeke wants to perform but fear says "skip it." What helps?**
   ID: `zkm6-68-q2` · Character: zeke · Module: `zeke-courage-challenge`
   Scene: Zeke wants to perform but fear says "skip it.". Scene: Before a team captain huddle, Zeke reads the room and the roster, flippy-stomach stage door (6-8).
   Choices: A. Choosing the step that matches what he values **(correct)** · B. Acting on what matters even while fear is present · C. Acting like it does not matter · D. Avoiding every risk
   Explanation: Yes. Values can guide Zeke past the fear voice.
9. **What is opportunity cost?**
   ID: `cq6-68-q2` · Character: caiden · Module: `quest-6`
   Scene: Caiden can spend 12 tokens on instant fun or save toward a 25-token workshop he wants next week.
   Choices: A. Spending now means fewer tokens for the workshop **(correct)** · B. Workshops are free · C. Instant fun has no cost · D. Saving is always wrong
   Explanation: Spending now trades away tokens that could fund the workshop.
10. **Which clue best supports Miranda's inference about the schedule?**
   ID: `mdn-68-q2` · Character: miranda · Module: `mirandas-detective-notebook`
   Scene: Miranda analyzed a sequence of muddy footprints leading from the gym to the library. The trail's straight path and deep impressions suggested purposeful movement rather than random wandering. After recovering a note beneath a reading table, she inferred that the missing schedule had been relocated intentionally for a team-building surprise, not removed because of a problem.
   Choices: A. The note said it was relocated for a team-building surprise **(correct)** · B. The footprints were shallow and scattered · C. Miranda found no evidence in the library · D. The gym door was left wide open
   Explanation: The note directly explains an intentional relocation, supporting Miranda's conclusion.

## Week 7 — Solving Problems Together

Product focus: **Problem Solving**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | Confidence Charger (`b4-confidence-charger`) | `src/data/b4/missions/mission7ConfidenceCharger.ts` | A puzzle is hard. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, confidence charger dock (K-1). / Your block tower fell down. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, effort-notice station (K-1). / What charges the Confidence Charger. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, try-again boost panel (K-1). | B-4 | Confidence / Growth Mindset |
| charlie | The Marshmallow Tower (`charlie-marshmallow-tower`) | `src/data/charlie/missions/mission7MarshmallowTower.ts` | Charlie's team must build the tallest tower using marshmallows and sticks. The first version leans like it heard a secret. / One teammate holds the base while another adds sticks. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, leaning-build table (K-1). / The tower leans a little. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, stick-and-puff station (K-1). | Charlie | Teamwork / Iteration |
| zeke | The Team Captain Test (`zeke-team-captain-test`) | `src/data/zeke/missions/mission7TeamCaptainTest.ts` | What kind choice can Zeke make. Scene: In the cafeteria, Zeke pauses near a table with an open seat, captain clipboard huddle (K-1). / A kid is standing alone at the edge of the game. Scene: In the cafeteria, Zeke pauses near a table with an open seat, pick-last roster board (K-1). / Why include everyone. Scene: In the cafeteria, Zeke pauses near a table with an open seat, team leader mat (K-1). | Zeke | Leadership / Inclusion |
| caiden | The Camp Supply Mission (`quest-7`) | `src/data/caiden/questAdaptiveCampSupplyMission.ts` | Caiden is packing for a nature walk in 20 minutes. His bag is empty. / B-4 shows a picture of a sun hat, sunscreen, and water. / Caiden has shoes on but forgot his socks for a long hike. | Caiden, B-4 | Organization, Organization & Preparation |

### K-1 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A puzzle is hard. What can B-4 say?**
   ID: `b4m7-k1-q1` · Character: b4 · Module: `b4-confidence-charger`
   Scene: A puzzle is hard. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, confidence charger dock (K-1).
   Choices: A. I can try one more piece **(correct)** · B. I am bad at everything · C. This puzzle is my enemy · D. I can take a short break, then try once more
   Explanation: Yes. Trying one more piece is brave and helpful.
2. **What should Charlie's team do if the tower falls?**
   ID: `cm7-k1-q1` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: Charlie's team must build the tallest tower using marshmallows and sticks. The first version leans like it heard a secret.
   Choices: A. Try again together **(correct)** · B. Pause and rebuild with one change · C. Blame the marshmallow · D. Eat the whole tower
   Explanation: Teams try again — falling is just round one.
3. **What kind choice can Zeke make?**
   ID: `zkm7-k1-q1` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: What kind choice can Zeke make. Scene: In the cafeteria, Zeke pauses near a table with an open seat, captain clipboard huddle (K-1).
   Choices: A. Invite the student to play **(correct)** · B. Leave them out · C. Say only fast kids matter · D. Pick the same friends every time
   Explanation: Yes. Including others is strong teamwork.
4. **Which item is missing from his bag?**
   ID: `cq7-k1-q1` · Character: caiden · Module: `quest-7`
   Scene: Caiden is packing for a nature walk in 20 minutes. His bag is empty.
   Choices: A. Water bottle **(correct)** · B. Small snack for the planned break · C. Notebook for trail notes · D. Bring nothing and guess what is needed
   Explanation: Water is essential for a nature walk.
5. **Your block tower fell down. What can B-4 say?**
   ID: `b4m7-k1-q2` · Character: b4 · Module: `b4-confidence-charger`
   Scene: Your block tower fell down. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, effort-notice station (K-1).
   Choices: A. Try again, one block at a time **(correct)** · B. This tower is hard today, but I can improve · C. The blocks are being mean · D. I quit building things
   Explanation: Nice. One block at a time charges confidence.
6. **One teammate holds the base while another adds sticks. What are they doing?**
   ID: `cm7-k1-q2` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: One teammate holds the base while another adds sticks. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, leaning-build table (K-1).
   Choices: A. Working together to keep the tower steady **(correct)** · B. Hiding marshmallows from the teacher · C. Competing to eat the fastest · D. Ignoring the tower completely
   Explanation: Teamwork! Different jobs help one tower.
7. **A kid is standing alone at the edge of the game. What can Zeke do?**
   ID: `zkm7-k1-q2` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: A kid is standing alone at the edge of the game. Scene: In the cafeteria, Zeke pauses near a table with an open seat, pick-last roster board (K-1).
   Choices: A. Invite them to join **(correct)** · B. Pick only his best friends · C. Say fast kids only · D. Ignore them
   Explanation: Nice. Zeke makes room for one more teammate.
8. **Which picture shows camp walk supplies?**
   ID: `cq7-k1-q2` · Character: caiden · Module: `quest-7`
   Scene: B-4 shows a picture of a sun hat, sunscreen, and water.
   Choices: A. Sun hat, sunscreen, water **(correct)** · B. Hat and water but no sunscreen · C. Sunscreen and water but no hat · D. Empty bag and no checklist
   Explanation: Hat, sunscreen, and water protect him on a sunny walk.
9. **What charges the Confidence Charger?**
   ID: `b4m7-k1-q3` · Character: b4 · Module: `b4-confidence-charger`
   Scene: What charges the Confidence Charger. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, try-again boost panel (K-1).
   Choices: A. Trying again even when it is hard **(correct)** · B. Learning from mistakes and trying again · C. Only doing easy things · D. Waiting until someone else does it
   Explanation: Yes. Effort and trying again fill the charger.
10. **The tower leans a little. What should the team do?**
   ID: `cm7-k1-q3` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: The tower leans a little. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, stick-and-puff station (K-1).
   Choices: A. Notice the wobble and fix the bottom **(correct)** · B. Add more height right away · C. Knock it down for fun · D. Pretend it is not leaning
   Explanation: Fix the base before going taller — smart team move.

### 2-3 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student makes a mistake while reading. What self-talk helps?**
   ID: `b4m7-23-q1` · Character: b4 · Module: `b4-confidence-charger`
   Scene: A student makes a mistake while reading. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, confidence charger dock (2-3).
   Choices: A. Mistakes help me learn **(correct)** · B. I can slow down and read one line at a time · C. Everyone is better than me · D. The book is rude
   Explanation: Correct. Helpful self-talk keeps the brain open to learning.
2. **What helps the team improve the tower?**
   ID: `cm7-23-q1` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: What helps the team improve the tower. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, marshmallow tower mat (2-3).
   Choices: A. Notice what made it fall **(correct)** · B. Build the same thing again without looking · C. Argue about whose marshmallow is best · D. Close their eyes
   Explanation: Fall forensics — what made it tip is the clue.
3. **What should Zeke say?**
   ID: `zkm7-23-q1` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: What should Zeke say. Scene: During recess team time, Zeke listens while the group figures out next steps, captain clipboard huddle (2-3).
   Choices: A. Come join us. We need anothe **(correct)** · B. You probably cannot play · C. Pause and notice one more detail first · D. Only my friends can join
   Explanation: Correct. Zeke invites them in with respect.
4. **Which checklist is complete?**
   ID: `cq7-23-q1` · Character: caiden · Module: `quest-7`
   Scene: Caiden’s cabin checklist: water, trail map, rain poncho, permission slip.
   Choices: A. All four items packed **(correct)** · B. Only water · C. Only permission slip · D. None of them
   Explanation: A complete checklist includes every required item.
5. **A math problem feels tricky. What self-talk helps?**
   ID: `b4m7-23-q2` · Character: b4 · Module: `b4-confidence-charger`
   Scene: A math problem feels tricky. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, effort-notice station (2-3).
   Choices: A. I can figure this out step by step **(correct)** · B. Math is hard right now, but I can improve · C. Math is my arch-enemy · D. I can ask one question after trying a step
   Explanation: Good self-talk. Step by step keeps your brain in the game.
6. **Charlie suggests a wider base. His teammate adds diagonal sticks. What is happening?**
   ID: `cm7-23-q2` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: Charlie suggests a wider base. His teammate adds diagonal sticks. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, leaning-build table (2-3).
   Choices: A. The team is combining ideas to make a stronger design **(correct)** · B. They are ignoring each other · C. They are building two separate towers · D. They forgot the assignment
   Explanation: Shared ideas beat solo guessing — teamwork plus iteration.
7. **The kid picked last looks nervous. What helps?**
   ID: `zkm7-23-q2` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: The kid picked last looks nervous. Scene: During recess team time, Zeke listens while the group figures out next steps, pick-last roster board (2-3).
   Choices: A. Zeke asks them to join the team **(correct)** · B. Say they probably cannot play · C. Pick the same friends again · D. Walk away from the game
   Explanation: Yes. A warm invite can change someone's whole day.
8. **What should he pack first?**
   ID: `cq7-23-q2` · Character: caiden · Module: `quest-7`
   Scene: The activity starts in 20 minutes. Caiden has not packed yet.
   Choices: A. Safety items: water and whistle **(correct)** · B. Games only · C. Extra shoes for fun · D. Nothing — wing it
   Explanation: Safety items like water and a whistle come first.
9. **Someone says "You can't do it." What helps in your head?**
   ID: `b4m7-23-q3` · Character: b4 · Module: `b4-confidence-charger`
   Scene: Someone says "You can't do it.". Scene: During camp check-in, B-4's mood scanner hums near the activity mats, try-again boost panel (2-3).
   Choices: A. I can practice and improve **(correct)** · B. They are right, so I should quit · C. I can try hard things in smaller steps · D. Only perfect people can learn
   Explanation: Yes. Practice is how skills grow.
10. **Version 1 fell. Version 2 stood taller but wobbled. What should Version 3 focus on?**
   ID: `cm7-23-q3` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: Version 1 fell. Version 2 stood taller but wobbled. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, stick-and-puff station (2-3).
   Choices: A. Stability before adding more height **(correct)** · B. Being the tallest immediately · C. Using fewer sticks on purpose · D. Stopping after Version 1
   Explanation: Stable first, tall second — iteration in action.

### 4-5 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **How can a student build confidence after struggling?**
   ID: `b4m7-45-q1` · Character: b4 · Module: `b4-confidence-charger`
   Scene: How can a student build confidence after struggling. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, confidence charger dock (4-5).
   Choices: A. Notice one piece of progress **(correct)** · B. Only focus on what went wrong · C. Compare themselves to everyone · D. Quit before feedback
   Explanation: Yes. Progress is proof that effort is working.
2. **Why should Charlie test a small tower before making it taller?**
   ID: `cm7-45-q1` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: Why should Charlie test a small tower before making it taller. Scene: At the invention table, Charlie Perk compares two test results side by side, marshmallow tower mat (4-5).
   Choices: A. To find weak spots early **(correct)** · B. To make the sticks nervous · C. To avoid teamwork · D. To learn what fails before full height attempts
   Explanation: Small tests reveal weak spots before the big wobble.
3. **How can Zeke be a fair captain?**
   ID: `zkm7-45-q1` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: How can Zeke be a fair captain. Scene: At the group project table, Zeke balances his idea with the team's plan, captain clipboard huddle (4-5).
   Choices: A. Notice strengths and give everyone a role **(correct)** · B. Only pass to his closest friends · C. Ignore quieter teammates · D. Let one person do everything
   Explanation: Yes. Fair leaders see strengths across the team.
4. **What is the best multi-step plan?**
   ID: `cq7-45-q1` · Character: caiden · Module: `quest-7`
   Scene: Caiden must gather: first-aid kit, team flag, water jugs, and activity cards.
   Choices: A. Safety first, then team items, then cards **(correct)** · B. Cards first, skip water · C. Grab random items · D. Wait until activity starts
   Explanation: Safety supplies first, then team gear, then activity materials.
5. **You failed the first attempt at a presentation. What is growth mindset?**
   ID: `b4m7-45-q2` · Character: b4 · Module: `b4-confidence-charger`
   Scene: You failed the first attempt at a presentation. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, effort-notice station (4-5).
   Choices: A. Learn from it and practice again **(correct)** · B. I am still learning this skill · C. Presentations feel hard, so I will practice in parts · D. Pretend it went perfectly
   Explanation: Yes. A first attempt is data, not a final grade.
6. **A teammate notices the middle joint is loose. What should the team do?**
   ID: `cm7-45-q2` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: A teammate notices the middle joint is loose. Scene: At the invention table, Charlie Perk compares two test results side by side, leaning-build table (4-5).
   Choices: A. Use the feedback and reinforce that joint **(correct)** · B. Ignore the comment and build higher · C. Argue until time runs out · D. Start over without talking
   Explanation: Good teams use feedback — that is iteration fuel.
7. **Zeke only passes to his closest friends. What is the problem?**
   ID: `zkm7-45-q2` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: Zeke only passes to his closest friends. Scene: At the group project table, Zeke balances his idea with the team's plan, pick-last roster board (4-5).
   Choices: A. It limits the team's ideas and growth **(correct)** · B. Fair chances help uncover hidden strengths · C. Fairness does not matter in games · D. Winning is all that counts
   Explanation: Yes. Fair captains spread chances across the team.
8. **What should Caiden do?**
   ID: `cq7-45-q2` · Character: caiden · Module: `quest-7`
   Scene: One teammate forgot a rain poncho. Skies look gray.
   Choices: A. Offer spare poncho if he has one and tell counselor **(correct)** · B. Laugh and leave · C. Take teammate’s bag · D. Ignore weather
   Explanation: Sharing spare gear and telling a counselor keeps the team safe.
9. **Comparing yourself to everyone hurts confidence. What is better?**
   ID: `b4m7-45-q3` · Character: b4 · Module: `b4-confidence-charger`
   Scene: Comparing yourself to everyone hurts confidence. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, try-again boost panel (4-5).
   Choices: A. Notice your own progress **(correct)** · B. Compare to your own progress from last week · C. Only do things you already win at · D. Copy what everyone else does
   Explanation: Right. Your progress is your proof.
10. **The team's tallest try fell. Their medium try stayed up. What is the smart next step?**
   ID: `cm7-45-q3` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: The team's tallest try fell. Their medium try stayed up. Scene: At the invention table, Charlie Perk compares two test results side by side, stick-and-puff station (4-5).
   Choices: A. Build on the stable medium design and improve it **(correct)** · B. Only chase height without stability · C. Stop iterating · D. Document what was stable in the medium try
   Explanation: Stable design plus small improvements — classic iteration.

### 6-8 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student thinks, "I always mess up." What is a stronger replacement thought?**
   ID: `b4m7-68-q1` · Character: b4 · Module: `b4-confidence-charger`
   Scene: B-4's Confidence Charger is low. It charges when someone notices effort, tries again, and uses helpful self-talk.
   Choices: A. This is hard, but I can improve with practice **(correct)** · B. I can try difficult things with support · C. Some people may notice, but I can still grow · D. If I am not perfect, I failed
   Explanation: Correct. Strong self-talk is honest and hopeful.
2. **What is the best design strategy?**
   ID: `cm7-68-q1` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: What is the best design strategy. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, marshmallow tower mat (6-8).
   Choices: A. Build a prototype, test it, revise the design **(correct)** · B. Start with one idea, then revise from test results · C. Make it tall before making it stable · D. Ignore feedback
   Explanation: Prototype → test → revise. Engineering in marshmallow form.
3. **What is inclusive leadership?**
   ID: `zkm7-68-q1` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: What is inclusive leadership. Scene: Before a team captain huddle, Zeke reads the room and the roster, captain clipboard huddle (6-8).
   Choices: A. Creating conditions where everyone can contribute **(correct)** · B. Winning while ignoring people · C. Building clear roles and fair opportunities · D. Making every decision alone
   Explanation: Correct. Inclusive leaders build belonging and performance.
4. **What should Caiden load first?**
   ID: `cq7-68-q1` · Character: caiden · Module: `quest-7`
   Scene: Limited wagon space. Items: water (critical), extra games (low), first-aid (critical), decor (low).
   Choices: A. Critical items: water and first-aid **(correct)** · B. Decor and games first · C. Random order · D. Leave wagon empty
   Explanation: Critical safety items earn space before low-priority extras.
5. **Thought: "Everyone else gets this except me." What is a better replacement?**
   ID: `b4m7-68-q2` · Character: b4 · Module: `b4-confidence-charger`
   Scene: Thought: "Everyone else gets this except me.". Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, effort-notice station (6-8).
   Choices: A. I am still learning, and that is okay **(correct)** · B. Questions help me learn faster · C. I must be the only confused person ever · D. If I struggle, I do not belong here
   Explanation: Yes. Learning takes time for everyone, even when it looks easy.
6. **Charlie's team documents each version: height, wobble, and what changed. Why?**
   ID: `cm7-68-q2` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: Charlie's team documents each version: height, wobble, and. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, leaning-build table (6-8).
   Choices: A. To compare prototypes and choose the best next revision **(correct)** · B. To impress the marshmallows · C. To avoid building anything · D. Because towers require poetry
   Explanation: Version notes turn wobbles into design decisions.
7. **Zeke wants to win but sees someone always picked last. Best leadership move?**
   ID: `zkm7-68-q2` · Character: zeke · Module: `zeke-team-captain-test`
   Scene: Zeke wants to win but sees someone always picked last. Best leadership move. Scene: Before a team captain huddle, Zeke reads the room and the roster, pick-last roster board (6-8).
   Choices: A. Create chances for them to contribute and belong **(correct)** · B. Win while ignoring them · C. Design plays that include newer teammates too · D. Make all decisions alone
   Explanation: Yes. Belonging and strong teams go together.
8. **How should Caiden plan ahead?**
   ID: `cq7-68-q2` · Character: caiden · Module: `quest-7`
   Scene: Forecast: afternoon storms. Morning is clear.
   Choices: A. Pack rain gear even if morning is clear **(correct)** · B. Skip rain gear — sun only · C. Plan only for morning · D. Ignore weather apps
   Explanation: Storms later mean rain gear now, even on a clear morning.
9. **How does effort relate to confidence?**
   ID: `b4m7-68-q3` · Character: b4 · Module: `b4-confidence-charger`
   Scene: How does effort relate to confidence. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, try-again boost panel (6-8).
   Choices: A. Effort builds skill over time **(correct)** · B. Effort means you are weak · C. Confidence only comes from talent · D. Trying hard proves you are failing
   Explanation: Exactly. Helpful self-talk is not fake. It is fair.
10. **One teammate wants height, another wants stability. What is the best team move?**
   ID: `cm7-68-q3` · Character: charlie · Module: `charlie-marshmallow-tower`
   Scene: One teammate wants height, another wants stability. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, stick-and-puff station (6-8).
   Choices: A. Test a prototype that balances both, then revise **(correct)** · B. Split up and build competing towers silently · C. Only build for height · D. Give up because ideas differ
   Explanation: Different goals become one tested prototype — teamwork wins.

## Week 8 — Keep Going

Product focus: **Perseverance**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| b4 | The Focus Flame Finale (`b4-focus-flame-finale`) | `src/data/b4/missions/mission8FocusFlameFinale.ts` | You feel mad. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, focus flame altar (K-1). / You feel sad. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, final mission review desk (K-1). / What does B-4's Focus Flame need. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, courage combo checklist (K-1). | B-4 | Reflection / Integrated SEL |
| charlie | The Great Science Fair Mystery (`charlie-science-fair-mystery`) | `src/data/charlie/missions/mission8ScienceFairMystery.ts` | Which project should Charlie trust more. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, science fair booth row (K-1). / One student measured plant height every day. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, opposite-results display (K-1). / A project says "music wins" but nobody wrote anything down. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, evidence compare desk (K-1). | Charlie | Critical Thinking / Evidence |
| zeke | The Final Huddle (`zeke-final-huddle`) | `src/data/zeke/missions/mission8FinalHuddle.ts` | What can each teammate share. Scene: In the cafeteria, Zeke pauses near a table with an open seat, final huddle circle (K-1). / Zeke asks. Scene: In the cafeteria, Zeke pauses near a table with an open seat, proud-and-frustrated line (K-1). / What does a huddle help the team do. Scene: In the cafeteria, Zeke pauses near a table with an open seat, last challenge recap (K-1). | Zeke | Group Reflection / Team Growth |
| caiden | The Homework Rescue Plan (`quest-8`) | `src/data/caiden/questAdaptiveHomeworkRescuePlan.ts` | Caiden has math practice and a reading page. Math is due first tomorrow. / Caiden wants to draw comics before any homework. / Three tasks: sharpen pencils, read one page, put books in bag. | Caiden, B-4 | Time Management, Time Management & Prioritization |

### K-1 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **You feel mad. What can help your Focus Flame?**
   ID: `b4m8-k1-q1` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: You feel mad. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, focus flame altar (K-1).
   Choices: A. Name the feeling and take a breath **(correct)** · B. Do the easiest calm step first · C. Pretend feelings are not real · D. Pause and notice one more detail first
   Explanation: Yes. Name it and breathe. That helps the flame stay steady.
2. **Which project should Charlie trust more?**
   ID: `cm8-k1-q1` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: Which project should Charlie trust more. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, science fair booth row (K-1).
   Choices: A. The one that watched carefully and kept track **(correct)** · B. The one with the biggest poster · C. The one with the funniest title · D. The one closest to snacks
   Explanation: Careful watching and notes beat flashy posters.
3. **What can each teammate share?**
   ID: `zkm8-k1-q1` · Character: zeke · Module: `zeke-final-huddle`
   Scene: What can each teammate share. Scene: In the cafeteria, Zeke pauses near a table with an open seat, final huddle circle (K-1).
   Choices: A. One feeling about the game **(correct)** · B. A mean comment · C. One helpful observation from the game · D. No reflection and immediate blame
   Explanation: Yes. Sharing one feeling helps the team understand each other.
4. **What should he do first?**
   ID: `cq8-k1-q1` · Character: caiden · Module: `quest-8`
   Scene: Caiden has math practice and a reading page. Math is due first tomorrow.
   Choices: A. Math practice **(correct)** · B. Check both due times, then pick first · C. Start with one math problem to build momentum · D. Avoid both tasks until late evening
   Explanation: Math is due first, so it comes first.
5. **You feel sad. What is a good first helper move?**
   ID: `b4m8-k1-q2` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: You feel sad. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, final mission review desk (K-1).
   Choices: A. Wait and hope sadness goes away by itself · B. Tell a grown-up or take a breath **(correct)** · C. Do one small calming step, then ask for help · D. Throw things so people notice you are sad
   Explanation: Good move. Naming sadness and getting help keeps the flame steady.
6. **One student measured plant height every day. Why is that helpful?**
   ID: `cm8-k1-q2` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: One student measured plant height every day. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, opposite-results display (K-1).
   Choices: A. It shows what changed over time **(correct)** · B. It makes the plant taller instantly · C. It replaces watering · D. It turns plants into music fans
   Explanation: Measuring over time is real evidence.
7. **Zeke asks how everyone feels. What is a good answer?**
   ID: `zkm8-k1-q2` · Character: zeke · Module: `zeke-final-huddle`
   Scene: Zeke asks. Scene: In the cafeteria, Zeke pauses near a table with an open seat, proud-and-frustrated line (K-1).
   Choices: A. I felt proud when we worked together **(correct)** · B. A mean comment about someone · C. One feeling and one thing they learned · D. Nothing at all
   Explanation: Nice. Sharing a real feeling helps the team connect.
8. **What helps him start homework?**
   ID: `cq8-k1-q2` · Character: caiden · Module: `quest-8`
   Scene: Caiden wants to draw comics before any homework.
   Choices: A. Do a small homework part, then draw **(correct)** · B. Set a 10-minute homework timer before drawing · C. Ask for help after finishing one short step · D. Skip homework and hope tomorrow works out
   Explanation: A small homework start builds momentum before comics.
9. **What does B-4's Focus Flame need?**
   ID: `b4m8-k1-q3` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: What does B-4's Focus Flame need. Scene: At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner, courage combo checklist (K-1).
   Choices: A. Feelings and helper moves working together **(correct)** · B. Only being happy all the time · C. Having feelings and using helper moves · D. Ignoring every body signal
   Explanation: Yes. Feel it, name it, choose a helper move.
10. **A project says "music wins" but nobody wrote anything down. What should Charlie think?**
   ID: `cm8-k1-q3` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: A project says "music wins" but nobody wrote anything down. Scene: In the school garden lab, Charlie Perk sets up a mini experiment tray, evidence compare desk (K-1).
   Choices: A. That is not strong evidence **(correct)** · B. It must be true because it sounds exciting · C. Claims need notes and measurements to be trusted · D. Snacks prove the result
   Explanation: No notes = weak evidence, even if it sounds cool.

### 2-3 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **A student feels nervous before a turn. What is the best match?**
   ID: `b4m8-23-q1` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: A student feels nervous before a turn. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, focus flame altar (2-3).
   Choices: A. Take a breath and ask for one small step **(correct)** · B. Quit immediately · C. Laugh at someone else · D. Ask for one small step, then keep going
   Explanation: Correct. Calm plus a small step helps the student begin.
2. **What makes a science fair test fair?**
   ID: `cm8-23-q1` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: What makes a science fair test fair. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, science fair booth row (2-3).
   Choices: A. Testing things the same way except for one change **(correct)** · B. Changing everything · C. Picking the answer first · D. Only writing down exciting results
   Explanation: Fair tests change one thing — that is how you know what caused the result.
3. **What should Zeke ask in the huddle?**
   ID: `zkm8-23-q1` · Character: zeke · Module: `zeke-final-huddle`
   Scene: What should Zeke ask in the huddle. Scene: During recess team time, Zeke listens while the group figures out next steps, final huddle circle (2-3).
   Choices: A. What went well, and what can we improve? **(correct)** · B. Who should we blame? · C. Who was the worst? · D. What is one thing we should try differently next time?
   Explanation: Correct. That question helps the team learn.
4. **Best order tonight?**
   ID: `cq8-23-q1` · Character: caiden · Module: `quest-8`
   Scene: Tasks: math (due tomorrow), reading (due tomorrow), comic (due Friday).
   Choices: A. Math, reading, then comic if time **(correct)** · B. Comic first always · C. Random order · D. Skip all three
   Explanation: Tomorrow items first; comic if time remains.
5. **You feel frustrated during a game. What matches best?**
   ID: `b4m8-23-q2` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: You feel frustrated during a game. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, final mission review desk (2-3).
   Choices: A. Take a breath and try again **(correct)** · B. Blame the game and stop trying · C. Blame the rules · D. Quit right away and avoid trying again
   Explanation: Good match. Calm plus try-again keeps the flame steady.
6. **Project A gave both plants the same water and light. Project B did not. Which is fairer?**
   ID: `cm8-23-q2` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: Project A gave both plants the same water and light. Project B did not. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, opposite-results display (2-3).
   Choices: A. Project A — both plants were treated the same except music **(correct)** · B. Project B is weaker because conditions changed unpredictably · C. Neither — fair tests do not exist · D. Both — if the poster is big enough
   Explanation: Same water and light means music is the only difference tested.
7. **The team lost but tried hard. What should Zeke ask?**
   ID: `zkm8-23-q2` · Character: zeke · Module: `zeke-final-huddle`
   Scene: The team lost but tried hard. Scene: During recess team time, Zeke listens while the group figures out next steps, proud-and-frustrated line (2-3).
   Choices: A. What went well, and what can we improve? **(correct)** · B. Who messed up the most? · C. Who should we blame? · D. How can we include everyone better next round?
   Explanation: Yes. Reflection looks for learning, not blame.
8. **What is realistic tonight?**
   ID: `cq8-23-q2` · Character: caiden · Module: `quest-8`
   Scene: Caiden estimates: math 20 min, reading 15 min, comic 40 min. He has 45 min.
   Choices: A. Math + reading = 35 min, start comic another night **(correct)** · B. All three fully · C. None — too hard · D. Comic only
   Explanation: Math and reading fit 45 minutes; comic needs another block.
9. **Name the feeling plus a helper move equals…**
   ID: `b4m8-23-q3` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: Name the feeling plus a helper move equals…. Scene: During camp check-in, B-4's mood scanner hums near the activity mats, courage combo checklist (2-3).
   Choices: A. A steadier Focus Flame **(correct)** · B. A plan for handling hard moments · C. Feeling more ready for the next challenge · D. Automatic winning
   Explanation: Yes. Small steps help brave feelings wake up.
10. **One project tested three plants with music and three in silence. Why is that better than one plant each?**
   ID: `cm8-23-q3` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: One project tested three plants with music and three in silence. Scene: During science club, Charlie Perk spreads out notes beside a curious setup, evidence compare desk (2-3).
   Choices: A. More plants give stronger evidence **(correct)** · B. Plants perform better in groups for applause · C. Larger samples reduce one-plant luck effects · D. Three plants means three posters
   Explanation: More than one plant helps you trust the pattern.

### 4-5 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **After calming down, what reflection helps most?**
   ID: `b4m8-45-q1` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: After calming down,. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, focus flame altar (4-5).
   Choices: A. What worked, and what can I try next time? **(correct)** · B. Who can I blame? · C. How can I avoid every hard thing? · D. Why did this ruin everything?
   Explanation: Yes. Reflection helps your next choice get stronger.
2. **What should Charlie compare?**
   ID: `cm8-45-q1` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: What should Charlie compare. Scene: At the invention table, Charlie Perk compares two test results side by side, science fair booth row (4-5).
   Choices: A. The evidence and how each test was done **(correct)** · B. Poster glitter levels · C. Who talked louder · D. Which plant looked cooler
   Explanation: Compare methods and evidence — not glitter volume.
3. **One teammate says they felt ignored. What should the team do?**
   ID: `zkm8-45-q1` · Character: zeke · Module: `zeke-final-huddle`
   Scene: One teammate says they felt ignored. Scene: At the group project table, Zeke balances his idea with the team's plan, final huddle circle (4-5).
   Choices: A. Listen and plan how to inclu **(correct)** · B. Tell them they are wrong · C. Change the subject · D. Say winning matters more
   Explanation: Yes. Listening helps the team repair and improve.
4. **Best schedule?**
   ID: `cq8-45-q1` · Character: caiden · Module: `quest-8`
   Scene: Math 25 min, reading 20 min, comic panels 45 min. Available: 60 min before club.
   Choices: A. Math + reading = 45, comic later **(correct)** · B. Comic full 45 first · C. All three fully in 60 · D. Skip club instead
   Explanation: Math and reading fit; comic needs another session.
5. **After a tough conversation, what reflection question helps?**
   ID: `b4m8-45-q2` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: After a tough conversation,. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, final mission review desk (4-5).
   Choices: A. What feeling did I have and what helped? **(correct)** · B. Who was the worst person in the room? · C. What words helped me stay respectful? · D. Why are feelings so annoying?
   Explanation: Good reflection. That turns the experience into a tool.
6. **The music project kept a chart of heights. The silence project only has a drawing. Which evidence is stronger?**
   ID: `cm8-45-q2` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: The music project kept a chart of heights. The silence project only has a drawing. Scene: At the invention table, Charlie Perk compares two test results side by side, opposite-results display (4-5).
   Choices: A. The chart with measured data **(correct)** · B. The drawing with no measurements · C. Both are equal because art is science · D. Neither — guess based on favorite song
   Explanation: Measured data beats a picture without numbers.
7. **Some teammates are proud, some frustrated. What should Zeke do?**
   ID: `zkm8-45-q2` · Character: zeke · Module: `zeke-final-huddle`
   Scene: Some teammates are proud, some frustrated. Scene: At the group project table, Zeke balances his idea with the team's plan, proud-and-frustrated line (4-5).
   Choices: A. Let everyone share and listen **(correct)** · B. Only let the captain talk · C. Pretend it was perfect · D. Blame the frustrated ones
   Explanation: Yes. Different feelings can all belong in a huddle.
8. **How should due dates shape the week?**
   ID: `cq8-45-q2` · Character: caiden · Module: `quest-8`
   Scene: Comic project due Friday; math quiz Thursday.
   Choices: A. Quiz prep before comic finishing **(correct)** · B. Only comic all week · C. Ignore quiz · D. Wait until Friday morning
   Explanation: Thursday quiz prep should lead the schedule.
9. **Brave choice plus calm body equals…**
   ID: `b4m8-45-q3` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: Brave choice plus calm body equals…. Scene: In the group challenge lab, B-4's feeling finder lights up on the side table, courage combo checklist (4-5).
   Choices: A. A better next decision **(correct)** · B. An automatic perfect day · C. More practice choosing a better next step · D. Proof that feelings are useless
   Explanation: Yes. Calm and brave together make stronger choices.
10. **Both projects ran two weeks. One changed water amounts halfway through. Why does that matter?**
   ID: `cm8-45-q3` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: Both projects ran two weeks. One changed water amounts halfway through. Scene: At the invention table, Charlie Perk compares two test results side by side, evidence compare desk (4-5).
   Choices: A. Changing water mid-test makes the results less fair **(correct)** · B. Water changes make posters shinier · C. It does not matter at all · D. Plants prefer surprise water
   Explanation: Mid-test changes muddy the evidence — hard to know what caused growth.

### 6-8 review set

Available: **17**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **Which full cycle shows strong self-regulation?**
   ID: `b4m8-68-q1` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: Which full cycle shows strong self-regulation. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, focus flame altar (6-8).
   Choices: A. Notice signal, name feeling, pause, choose strategy, reflect **(correct)** · B. React fast, explain later, avoid repair · C. Ignore feeling, push harder, shut down · D. Blame someone, quit, move on
   Explanation: Correct. That is a full Focus Flame regulation cycle.
2. **Which claim is strongest?**
   ID: `cm8-68-q1` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: Which claim is strongest. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, science fair booth row (6-8).
   Choices: A. The claim supported by repeated, fair evidence **(correct)** · B. The claim with the most confident speaker · C. The claim that sounds surprising · D. The claim with no measurements
   Explanation: Repeated fair evidence wins over confident speeches.
3. **What makes a team reflection useful?**
   ID: `zkm8-68-q1` · Character: zeke · Module: `zeke-final-huddle`
   Scene: What makes a team reflection useful. Scene: Before a team captain huddle, Zeke reads the room and the roster, final huddle circle (6-8).
   Choices: A. Honest feedback connected to a clear next action **(correct)** · B. Everyone pretending it was perfect · C. Only the captain talking · D. Addressing hard feedback respectfully
   Explanation: Correct. Reflection should lead to a better next move.
4. **Strongest time-block plan?**
   ID: `cq8-68-q1` · Character: caiden · Module: `quest-8`
   Scene: Tasks: math set (45m), reading log (20m), comic script (60m), pack for camp (15m). Evening free: 90m.
   Choices: A. Math 45 + reading 20 + pack 15 = 80, comic tomorrow **(correct)** · B. Comic 60 only · C. All four in 90 without cuts · D. Pack only
   Explanation: Math, reading, and pack fit 80 minutes; comic rolls forward.
5. **Which step comes right after "pause" in the regulation cycle?**
   ID: `b4m8-68-q2` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: Which step comes right after "pause" in the regulation cycle. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, final mission review desk (6-8).
   Choices: A. Choose a strategy **(correct)** · B. Blame someone else · C. Pretend nothing happened · D. Quit the activity
   Explanation: Yes. After pause, you pick a helpful strategy.
6. **The music project tested 6 plants with controlled light, water, and soil. The silence project used 1 plant near a window. What is Charlie's best critique?**
   ID: `cm8-68-q2` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: The music project tested 6 plants with controlled light, water, and soil. The silence project used 1 plant near a window. Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, opposite-results display (6-8).
   Choices: A. The music project has stronger sample size and controlled variables **(correct)** · B. The silence project wins because it is simpler · C. Sample size matters when judging reliability · D. Window location does not affect plants
   Explanation: Sample size plus controlled variables — that is stronger evidence.
7. **A teammate shares they felt ignored during the challenge. Best team response?**
   ID: `zkm8-68-q2` · Character: zeke · Module: `zeke-final-huddle`
   Scene: A teammate shares they felt ignored during the challenge. Best team response. Scene: Before a team captain huddle, Zeke reads the room and the roster, proud-and-frustrated line (6-8).
   Choices: A. Listen, validate, and plan a concrete next step **(correct)** · B. Dismiss their experience · C. Change topic quickly · D. Prioritize winning over belonging
   Explanation: Yes. Feedback becomes growth when it leads to action.
8. **How many focus blocks for 50-minute math?**
   ID: `cq8-68-q2` · Character: caiden · Module: `quest-8`
   Scene: Caiden uses Pomodoro: 25 focus, 5 break. Math needs deep focus.
   Choices: A. Two 25-minute focus blocks **(correct)** · B. One 5-minute block · C. Ten breaks, zero focus · D. Skip math
   Explanation: Two 25-minute blocks cover 50 minutes of math.
9. **Why practice the full regulation cycle?**
   ID: `b4m8-68-q3` · Character: b4 · Module: `b4-focus-flame-finale`
   Scene: Why practice the full regulation cycle. Scene: At the older learners' studio, B-4's dashboard shows a rising feeling alert, courage combo checklist (6-8).
   Choices: A. It builds habits for future hard moments **(correct)** · B. Repeated practice builds stronger habits · C. It helps you recover faster when upset happens · D. It replaces asking for help
   Explanation: Exactly. Self-regulation is a sequence you can practice.
10. **A judge says, "I love music, so the music project wins." What should Charlie argue?**
   ID: `cm8-68-q3` · Character: charlie · Module: `charlie-science-fair-mystery`
   Scene: A judge says, "I love music, so the music project wins.". Scene: In the advanced science studio, Charlie Perk tracks clues from the latest trial, evidence compare desk (6-8).
   Choices: A. Personal preference is not the same as scientific evidence **(correct)** · B. Judges should score based on evidence quality · C. Loud opinions are better than data · D. Evidence only matters for grown-ups
   Explanation: Evidence beats opinions — even musical ones.

## Week 9 — Focus Flame Celebration

Product focus: **Confidence + Reflection**.

### Approved source modules

| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |
|---|---|---|---|---|---|
| caiden | The Camp Leader Challenge (`quest-9`) | `src/data/caiden/questAdaptiveCampLeaderChallenge.ts` | Caiden is team leader. A teammate drops their craft supplies. / Two friends argue about which path to take on the trail. / A teammate feels nervous about the rope bridge. | Caiden, B-4, Mia | Leadership, Leadership & Teamwork |

### K-1 review set

Available: **10**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **What should Caiden say?**
   ID: `cq9-k1-q1` · Character: caiden · Module: `quest-9`
   Scene: Caiden is team leader. A teammate drops their craft supplies.
   Choices: A. “I can help you pick those up.” **(correct)** · B. “Try picking up one side and I will get the other.” · C. “Let’s ask a teammate to help us quickly.” · D. “Ignore it and leave the mess.”
   Explanation: Offering help shows kind leadership.
2. **How can Caiden help?**
   ID: `cq9-k1-q2` · Character: caiden · Module: `quest-9`
   Scene: Two friends argue about which path to take on the trail.
   Choices: A. Listen to both ideas, then suggest asking a counselor together · B. Wait quietly and hope they figure it out · C. Ask a counselor for help together **(correct)** · D. Pick one side and insult the other person
   Explanation: Getting a counselor helps solve the problem safely.
3. **What should Caiden do?**
   ID: `cq9-k1-q3` · Character: caiden · Module: `quest-9`
   Scene: A teammate feels nervous about the rope bridge.
   Choices: A. Encourage them and walk beside them **(correct)** · B. Say “hurry up!” · C. Cross without them · D. Make fun of them
   Explanation: Encouragement and company help nervous friends.
4. **What makes a good leader here?**
   ID: `cq9-k1-q4` · Character: caiden · Module: `quest-9`
   Scene: Caiden’s team must carry a banner together.
   Choices: A. Hold his side and cheer the team **(correct)** · B. Keep pace and check if teammates need support · C. Coordinate steps so everyone lifts together · D. Drop the banner and walk away
   Explanation: Doing his part and cheering others is strong teamwork.
5. **What is a good answer?**
   ID: `cq9-k1-q5` · Character: caiden · Module: `quest-9`
   Scene: B-4 asks what leaders do.
   Choices: A. Help the team and listen **(correct)** · B. Boss everyone meanly · C. Only think about winning · D. Ignore teammates
   Explanation: Leaders help and listen to their team.
6. **What should he do?**
   ID: `cq9-k1-q6` · Character: caiden · Module: `quest-9`
   Scene: Caiden sees a teammate sitting alone at lunch.
   Choices: A. Invite them to sit with the group **(correct)** · B. Point and laugh · C. Ignore them · D. Take their seat
   Explanation: Inviting someone in shows caring leadership.
7. **What should Caiden say?**
   ID: `cq9-k1-q7` · Character: caiden · Module: `quest-9`
   Scene: The team wins a small prize. Everyone helped.
   Choices: A. “Great job, team!” **(correct)** · B. “I did it all alone.” · C. “Prize is mine only.” · D. Say nothing
   Explanation: Sharing credit builds team spirit.
8. **Fair choice?**
   ID: `cq9-k1-q8` · Character: caiden · Module: `quest-9`
   Scene: Caiden must pick a teammate to go first in a relay.
   Choices: A. Someone who has not gone first yet **(correct)** · B. Only his best friend always · C. Himself every time · D. Pick nobody
   Explanation: Giving others a turn is fair leadership.
9. **What can Caiden do as leader?**
   ID: `cq9-k1-q9` · Character: caiden · Module: `quest-9`
   Scene: The team cannot hear the next camp direction because everyone is talking.
   Choices: A. Talk louder than everyone else · B. Ask the team to pause and listen **(correct)** · C. Leave before the direction is finished · D. Choose a different activity without asking
   Explanation: A calm pause helps the whole team hear the direction and stay together.
10. **What is the responsible choice?**
   ID: `cq9-k1-q10` · Character: caiden · Module: `quest-9`
   Scene: Caiden forgets to bring the team marker to the challenge station.
   Choices: A. Say another teammate lost it · B. Hide the empty marker bag · C. Tell the counselor and help fix the mistake **(correct)** · D. Pretend the team does not need it
   Explanation: Responsible leaders tell the truth about mistakes and help make things right.

### 2-3 review set

Available: **10**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **What shows sharing leadership?**
   ID: `cq9-23-q1` · Character: caiden · Module: `quest-9`
   Scene: Caiden and co-leader Mia must share jobs: timer, cheer, supplies.
   Choices: A. Split jobs clearly and thank Mia **(correct)** · B. Take every job · C. Let Mia do everything · D. Argue until time is up
   Explanation: Clear splits and thanks show shared leadership.
2. **How do leaders solve disagreements?**
   ID: `cq9-23-q2` · Character: caiden · Module: `quest-9`
   Scene: Teammates disagree on flag color for their banner.
   Choices: A. Listen to both ideas, then vote or blend **(correct)** · B. Pick favorite friend’s idea only · C. Rip the banner · D. Quit the team
   Explanation: Listening and voting or blending finds fair solutions.
3. **What should Caiden say?**
   ID: `cq9-23-q3` · Character: caiden · Module: `quest-9`
   Scene: A teammate keeps interrupting instructions.
   Choices: A. “Let’s hear the full directions, then your idea.” **(correct)** · B. “Hold that thought; we will come back to it next.” · C. “Can we take turns so everyone gets heard?” · D. “I am done listening, figure it out yourselves.”
   Explanation: A kind boundary protects listening time for everyone.
4. **How can Caiden help the team?**
   ID: `cq9-23-q4` · Character: caiden · Module: `quest-9`
   Scene: One teammate is great at drawing; another at measuring.
   Choices: A. Assign drawing and measuring to those strengths **(correct)** · B. Pair strong and learning teammates by task · C. Rotate jobs after each clear checkpoint · D. Assign random jobs and skip planning
   Explanation: Using strengths makes the team faster and happier.
5. **What should Caiden do first?**
   ID: `cq9-23-q5` · Character: caiden · Module: `quest-9`
   Scene: The team is behind schedule.
   Choices: A. Check the plan and assign quick next steps **(correct)** · B. Panic and blame · C. Give up · D. Start a new unrelated game
   Explanation: Reviewing the plan and assigning steps gets the team moving.
6. **Best response?**
   ID: `cq9-23-q6` · Character: caiden · Module: `quest-9`
   Scene: A teammate says, “I cannot do it.”
   Choices: A. “Let’s try one small part together.” **(correct)** · B. “Yes you can — go alone.” · C. “You are out.” · D. Ignore them
   Explanation: One small part together builds confidence.
7. **What shows responsibility?**
   ID: `cq9-23-q7` · Character: caiden · Module: `quest-9`
   Scene: Caiden notices someone left out of a team photo.
   Choices: A. Ask them to join before the photo **(correct)** · B. Take photo without them · C. Laugh about it · D. Delete the photo
   Explanation: Inviting them in shows responsible, inclusive leadership.
8. **Strongest answer?**
   ID: `cq9-23-q8` · Character: caiden · Module: `quest-9`
   Scene: B-4 asks what makes a good camp leader.
   Choices: A. Listens, helps, and stays calm **(correct)** · B. Loudest voice wins · C. Never asks for help · D. Only cares about prizes
   Explanation: Listening, helping, and calm are core leader traits.
9. **What should Caiden do first?**
   ID: `cq9-23-q9` · Character: caiden · Module: `quest-9`
   Scene: The timer is running, but two teammates are unsure which job comes next.
   Choices: A. Give both teammates every remaining job · B. Check the plan and name one clear next job for each person **(correct)** · C. Wait for someone else to notice · D. Start cheering without explaining the jobs
   Explanation: Clear next jobs help teammates act without adding confusion or blame.
10. **How can Caiden respond like a responsible co-leader?**
   ID: `cq9-23-q10` · Character: caiden · Module: `quest-9`
   Scene: Mia notices the supply count is wrong after Caiden checked it.
   Choices: A. Thank Mia and count the supplies together **(correct)** · B. Tell Mia not to question the leader · C. Erase the supply list · D. Keep the wrong count so the team can leave sooner
   Explanation: Checking together uses Mia’s observation and protects the team’s plan.

### 4-5 review set

Available: **10**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **How should Caiden resolve it?**
   ID: `cq9-45-q1` · Character: caiden · Module: `quest-9`
   Scene: Two teammates argue about who carries the heavy water jug.
   Choices: A. Suggest switching every few minutes **(correct)** · B. Let one person carry all day · C. Drop the jug · D. Leave team
   Explanation: Switching shares the hard job fairly.
2. **What should Caiden do?**
   ID: `cq9-45-q2` · Character: caiden · Module: `quest-9`
   Scene: Team challenge: build a raft. Ideas clash — tape vs rope design.
   Choices: A. Combine best parts and test a small model **(correct)** · B. Pick randomly · C. Destroy both ideas · D. Quit challenge
   Explanation: Merging ideas and testing a model uses everyone’s input.
3. **What should Caiden say?**
   ID: `cq9-45-q3` · Character: caiden · Module: `quest-9`
   Scene: A teammate made a mistake that slowed the team.
   Choices: A. “Mistakes happen — let’s fix it together.” **(correct)** · B. “You ruined everything.” · C. Publicly shame them · D. Ignore the problem
   Explanation: Fixing together keeps trust and momentum.
4. **Best delegation?**
   ID: `cq9-45-q4` · Character: caiden · Module: `quest-9`
   Scene: Caiden must delegate: navigator, builder, timekeeper.
   Choices: A. Match roles to skills and confirm understanding **(correct)** · B. Assign randomly without talking · C. Do all roles himself · D. Skip roles
   Explanation: Skill-matched roles with clear understanding work best.
5. **What leadership move helps?**
   ID: `cq9-45-q5` · Character: caiden · Module: `quest-9`
   Scene: Team morale drops after a lost round.
   Choices: A. Name one thing the team did well and next step **(correct)** · B. Complain about judges · C. Give up · D. Blame one person
   Explanation: Highlighting a win plus a next step rebuilds morale.
6. **What shows maturity?**
   ID: `cq9-45-q6` · Character: caiden · Module: `quest-9`
   Scene: Caiden disagrees with a counselor’s safety rule.
   Choices: A. Ask respectfully why, then follow rule **(correct)** · B. Break rule to win · C. Encourage team to break it · D. Mock counselor
   Explanation: Respectful questions, then following rules, keeps everyone safe.
7. **How can Caiden help?**
   ID: `cq9-45-q7` · Character: caiden · Module: `quest-9`
   Scene: Two quiet teammates have good ideas but do not speak up.
   Choices: A. Ask each for one idea in round-robin **(correct)** · B. Only call on loud members · C. Ignore quiet members · D. Finish without them
   Explanation: Round-robin invites quiet voices without pressure.
8. **Best reflection?**
   ID: `cq9-45-q8` · Character: caiden · Module: `quest-9`
   Scene: B-4 debrief: how did Caiden handle disagreement?
   Choices: A. We listened, blended ideas, and tried a test **(correct)** · B. We paused, clarified goals, and chose one next step · C. We had no plan · D. We blamed each other and stopped
   Explanation: Listen, blend, test — a solid conflict pattern.
9. **Which response best keeps the team learning?**
   ID: `cq9-45-q9` · Character: caiden · Module: `quest-9`
   Scene: The raft test fails because a rope knot slips, and the team starts blaming the builder.
   Choices: A. Replace the builder without discussing the test · B. Ignore the slipped knot and repeat the same design · C. Review where the knot slipped, adjust it, and test again **(correct)** · D. End the challenge before anyone can make another mistake
   Explanation: Reviewing evidence and testing a repair turns the mistake into useful team learning.
10. **What should Caiden prioritize?**
   ID: `cq9-45-q10` · Character: caiden · Module: `quest-9`
   Scene: The timekeeper says the team needs five more minutes, but the navigator says the route is unsafe.
   Choices: A. Choose the faster route without checking it · B. Pause for the safety concern, then revise the plan **(correct)** · C. Let the two teammates argue until time expires · D. Remove both teammates from their roles
   Explanation: A leader protects safety first, then helps the team adjust time and route decisions.

### 6-8 review set

Available: **10**. Review set: **10**. Status: **draft review target; not runtime-enforced**.

1. **How should Caiden coordinate?**
   ID: `cq9-68-q1` · Character: caiden · Module: `quest-9`
   Scene: Team must cross a puzzle bridge in 15 minutes. Skills vary widely.
   Choices: A. Assign sub-teams with clear checkpoints **(correct)** · B. Everyone does random tasks · C. Leader does everything · D. Skip puzzle
   Explanation: Sub-teams and checkpoints keep coordination tight under time.
2. **What should Caiden do?**
   ID: `cq9-68-q2` · Character: caiden · Module: `quest-9`
   Scene: Teammate wants to shortcut a safety checkpoint.
   Choices: A. Hold the line on safety and explain why **(correct)** · B. Allow shortcut to win · C. Mock safety rules · D. Leave team
   Explanation: Leaders protect safety even when speed tempts shortcuts.
3. **Best leadership judgment?**
   ID: `cq9-68-q3` · Character: caiden · Module: `quest-9`
   Scene: Conflict: two strong planners both want to direct.
   Choices: A. Split phases: one plans route, one plans gear **(correct)** · B. Let them argue · C. Remove both · D. Cancel mission
   Explanation: Phase splits use both planners without collision.
4. **What should Caiden do?**
   ID: `cq9-68-q4` · Character: caiden · Module: `quest-9`
   Scene: Team receives unclear instructions from staff.
   Choices: A. Ask staff to repeat and confirm with team **(correct)** · B. Guess and rush · C. Blame teammates · D. Ignore instructions
   Explanation: Clarifying with staff prevents costly team mistakes.
5. **How should Caiden respond?**
   ID: `cq9-68-q5` · Character: caiden · Module: `quest-9`
   Scene: A teammate is upset after harsh feedback from another member.
   Choices: A. Private check-in, then facilitate calm talk **(correct)** · B. Ignore feelings · C. Take sides publicly · D. Kick someone off team
   Explanation: Private check-in plus calm talk repairs trust.
6. **Decision process?**
   ID: `cq9-68-q6` · Character: caiden · Module: `quest-9`
   Scene: Resources scarce: one extra rope, two possible uses.
   Choices: A. Score options by safety and mission goal **(correct)** · B. Check risk, usefulness, then decide as a team · C. Ask one clarifying question before choosing · D. Choose randomly and skip safety review
   Explanation: Scoring safety and mission fit leads sound resource calls.
7. **What shows leadership?**
   ID: `cq9-68-q7` · Character: caiden · Module: `quest-9`
   Scene: Caiden’s team finishes early. Another team struggles nearby.
   Choices: A. Offer one helper if staff approves **(correct)** · B. Taunt other team · C. Pack up silently · D. Take their supplies
   Explanation: Offering help (with staff OK) models camp citizenship.
8. **Best summary?**
   ID: `cq9-68-q8` · Character: caiden · Module: `quest-9`
   Scene: B-4 asks how leaders solve disagreements.
   Choices: A. Loudest person decides · B. Listen, clarify goals, agree on a testable plan **(correct)** · C. Take a breath and ask each person for one solution · D. Walk away so the conflict grows
   Explanation: Listen, clarify goals, test — durable disagreement protocol.
9. **What is the strongest leadership response?**
   ID: `cq9-68-q9` · Character: caiden · Module: `quest-9`
   Scene: A checkpoint delay means the team cannot finish every planned task before camp closes.
   Choices: A. Hide the delay and keep every deadline unchanged · B. Ask the fastest teammate to complete everything alone · C. Clarify the essential goal, revise roles, and communicate the new plan **(correct)** · D. Cancel the remaining work without telling staff
   Explanation: Re-centering the goal and communicating a realistic plan helps the team adapt responsibly.
10. **How should Caiden respond?**
   ID: `cq9-68-q10` · Character: caiden · Module: `quest-9`
   Scene: During the debrief, a quiet teammate says the group dismissed their safety idea earlier.
   Choices: A. Explain that leaders cannot hear every idea · B. Acknowledge the missed input, ask for the idea, and change the next discussion process **(correct)** · C. End the debrief before the team becomes uncomfortable · D. Ask the teammate to speak only with staff next time
   Explanation: Accountability includes hearing the missed idea and improving how the team includes quieter voices.

## Blocking findings

- No Week 3–9 grade-band coverage gap remains: every supported band has at least 10 production questions per week.
- Static content has no enforceable draft/published status. Week 5–9 cannot be made true drafts without changing the runtime publication model or applying the deferred learning-engagement migration.
- The full question audit still reports production-wide duplicate and distractor-quality warnings; see `reports/question-audit.md` for the complete list. These are quality blockers for a broad production publication decision, not missing Week 3–9 coverage.
