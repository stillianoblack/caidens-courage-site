import { registerModuleTracking } from '../moduleTrackingRegistry';
import type {
  CaidenQuestAccent,
  ExecutiveFunctionInteractionType,
  GameAssessmentConfig,
  GameChoiceQuestion,
  GameQuestion,
  GameSequenceQuestion,
} from '../../types/gameAssessment';
import { CAIDEN_MISSION_AVATAR, CAIDEN_SCENARIO_ICON_SRC } from './sharedAssets';

export type FocusFlameDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type FocusFlameContentStatus = 'draft' | 'published';
export type FocusFlameIllustrationKey =
  | 'backpack'
  | 'classroom'
  | 'notebook'
  | 'planner'
  | 'timer'
  | 'checklist'
  | 'focus-flame'
  | 'b4-technology'
  | 'camp';

type Choice = readonly [label: string, incorrectFeedback: string];

type ChoiceChallenge = {
  kind: 'choice';
  id: string;
  interactionType: Exclude<ExecutiveFunctionInteractionType, 'sequencing'>;
  scenario: string;
  prompt: string;
  choices: readonly [Choice, Choice, Choice, Choice];
  correctIndex: 0 | 1 | 2 | 3;
  correctFeedback: string;
  illustrationKey: FocusFlameIllustrationKey;
};

type SequenceChallenge = {
  kind: 'sequence';
  id: string;
  interactionType: 'sequencing';
  scenario: string;
  prompt: string;
  items: readonly [string, string, string, string];
  correctOrder: readonly [number, number, number, number];
  correctFeedback: string;
  incorrectFeedback: string;
  illustrationKey: FocusFlameIllustrationKey;
};

export type FocusFlameChallenge = ChoiceChallenge | SequenceChallenge;

export type FocusFlameChallengeMission = {
  id: string;
  week: number;
  prerequisiteQuestId: string;
  name: string;
  difficulty: FocusFlameDifficulty;
  badge: string;
  badgeProgressionValue: number;
  skills: string[];
  status: FocusFlameContentStatus;
  gradeSupport: {
    primary: '3-6';
    adaptations: Partial<Record<'K-2' | '7-8', FocusFlameChallenge[]>>;
  };
  completionMessage: string;
  challenges: FocusFlameChallenge[];
};

const DISTRACTION = 'That notices the problem, but it does not change what is pulling attention away.';
const PRIORITY = 'That could help later, but it does not protect the most urgent responsibility first.';
const TOO_MANY = 'Starting several things at once makes it harder to finish the most important step.';
const RUSHING = 'Moving fast without checking can create more work when an important detail is missed.';

function choice(
  id: string,
  interactionType: ChoiceChallenge['interactionType'],
  illustrationKey: FocusFlameIllustrationKey,
  scenario: string,
  prompt: string,
  choices: ChoiceChallenge['choices'],
  correctIndex: ChoiceChallenge['correctIndex'],
  correctFeedback: string,
): ChoiceChallenge {
  return { kind: 'choice', id, interactionType, illustrationKey, scenario, prompt, choices, correctIndex, correctFeedback };
}

function sequence(
  id: string,
  illustrationKey: FocusFlameIllustrationKey,
  scenario: string,
  prompt: string,
  items: SequenceChallenge['items'],
  correctOrder: SequenceChallenge['correctOrder'],
  correctFeedback: string,
  incorrectFeedback: string,
): SequenceChallenge {
  return { kind: 'sequence', id, interactionType: 'sequencing', illustrationKey, scenario, prompt, items, correctOrder, correctFeedback, incorrectFeedback };
}

export const FOCUS_FLAME_CHALLENGE_MISSIONS: FocusFlameChallengeMission[] = [
  {
    id: 'focus-flame-week-3',
    week: 3,
    prerequisiteQuestId: 'quest-3',
    name: 'Focus Recovery',
    difficulty: 'beginner',
    badge: 'Focus Recovery Badge',
    badgeProgressionValue: 1,
    skills: ['noticing distractions', 'returning attention', 'emotional reset', 'self-awareness'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'You noticed distractions, reset, and brought your focus back.',
    challenges: [
      choice('ffc-w3-c1', 'identify_distraction', 'classroom', 'During quiet reading, two classmates whisper near your desk and you keep rereading the same line.', 'What is the distraction you need to handle first?', [['The whispering nearby', ''], ['The book title', DISTRACTION], ['Your bookmark color', DISTRACTION], ['The next chapter', DISTRACTION]], 0, 'Right. Naming the real distraction is the first step toward changing it.'),
      choice('ffc-w3-c2', 'best_response', 'focus-flame', 'You feel frustrated after getting a math answer wrong, and your thoughts keep replaying the mistake.', 'What is the best focus-recovery move?', [['Start three easier problems at once', TOO_MANY], ['Take one slow breath, name the feeling, and return to the next step', ''], ['Erase the whole page before checking the work', RUSHING], ['Switch to organizing pencils for the rest of class', PRIORITY]], 1, 'A brief emotional reset makes room for the next useful step.'),
      sequence('ffc-w3-c3', 'b4-technology', 'B-4 shows a four-step reset when a notification breaks your homework focus.', 'Put the reset steps in the strongest order.', ['Return to the exact problem you paused', 'Silence the notification', 'Notice that your attention moved', 'Take one steady breath'], [2, 1, 3, 0], 'Notice, change the distraction, reset, then return.', 'Try again. Recovery works best when you notice the shift before changing the environment and returning.'),
      choice('ffc-w3-c4', 'plan_revision', 'notebook', 'You planned to write for 20 minutes, but after five minutes you realize you do not understand the directions.', 'How should you revise the plan?', [['Keep writing quickly and hope it matches', RUSHING], ['Stop for the day and reorganize the notebook', PRIORITY], ['Ask one clear question, then restart the 20-minute block', ''], ['Begin the art portion before the writing directions are clear', TOO_MANY]], 2, 'A clear question removes the blocker while keeping the original goal.'),
      choice('ffc-w3-c5', 'reflection', 'focus-flame', 'You returned to your task after a loud hallway interruption.', 'Which reflection will help next time?', [['“I noticed the noise, moved seats, and found my place again.”', ''], ['“I should never notice sounds.”', DISTRACTION], ['“I work best when I change tasks every minute.”', TOO_MANY], ['“I only recovered because the work was easy.”', 'That misses the recovery steps you chose and cannot reuse later.']], 0, 'Naming the steps you used turns one recovery into a strategy you can repeat.'),
      choice('ffc-w3-c6', 'prioritization', 'timer', 'Your break timer rings while you are building a complicated game level, and homework starts in two minutes.', 'What should happen first?', [['Add one more level because stopping feels hard', PRIORITY], ['Save the game and close it before homework time', ''], ['Open homework while the game keeps running', TOO_MANY], ['Sort the game files before saving', PRIORITY]], 1, 'Saving and closing creates a clean transition back to the urgent responsibility.'),
      choice('ffc-w3-c7', 'best_response', 'camp', 'At camp, you miss part of the safety direction because you were watching another group.', 'What is the best recovery?', [['Copy what the fastest camper does', RUSHING], ['Ask the leader to repeat the missed direction, then restate it', ''], ['Start gathering supplies before checking', PRIORITY], ['Wait until the activity begins to see what happens', 'Waiting keeps the important safety gap open.']], 1, 'Asking and restating brings attention back and confirms the direction.'),
      sequence('ffc-w3-c8', 'planner', 'After lunch, your mind feels busy and you need to restart a school project.', 'Build a short return-to-focus plan.', ['Begin the first listed action', 'Choose the one next project step', 'Clear unrelated materials', 'Check the project direction'], [2, 3, 1, 0], 'A clear space and direction make the next action easier to begin.', 'Try again. Clear the extra pull, confirm the direction, choose one step, then start it.'),
    ],
  },
  {
    id: 'focus-flame-week-4',
    week: 4,
    prerequisiteQuestId: 'quest-4',
    name: 'Planning Power',
    difficulty: 'intermediate',
    badge: 'Planning Power Badge',
    badgeProgressionValue: 1,
    skills: ['planning', 'sequencing', 'organization', 'preparation'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'Great planners make today’s decisions easier for tomorrow.',
    challenges: [
      sequence('ffc-w4-c1', 'backpack', 'You need a signed form, gym shoes, lunch, and a charged tablet tomorrow.', 'Put the preparation steps in a reliable order.', ['Pack the checked items', 'List what tomorrow requires', 'Place the backpack by the door', 'Check each item against the list'], [1, 0, 3, 2], 'List, pack, check, and place the bag where you will remember it.', 'Try again. A plan starts with requirements and ends with a final check and ready location.'),
      choice('ffc-w4-c2', 'prioritization', 'planner', 'A science model is due tomorrow, reading is due Friday, and your desk drawer is messy.', 'What belongs first in tonight’s plan?', [['Reorganize the drawer because it feels easiest', PRIORITY], ['Finish the science model due tomorrow', ''], ['Begin both assignments and switch every five minutes', TOO_MANY], ['Help a friend decorate their model before yours is ready', PRIORITY]], 1, 'The closest important deadline gets protected first.'),
      choice('ffc-w4-c3', 'checklist_building', 'checklist', 'Your group will record a presentation after lunch.', 'Which checklist is most useful?', [['Camera, script, charged microphone, quiet location', ''], ['Choose outfits, rename folders, browse music, then find the script', 'That list spends time on extras before required materials.'], ['Bring every classroom supply just in case', 'A huge list makes the essential items harder to see.'], ['Start recording and collect missing items later', RUSHING]], 0, 'A short checklist of required tools prevents avoidable delays.'),
      choice('ffc-w4-c4', 'plan_revision', 'timer', 'The bus arrives 10 minutes earlier than expected, but your morning plan takes 25 minutes.', 'How should you revise it?', [['Keep every step and move twice as fast', RUSHING], ['Choose the must-do steps, pack the rest, and leave on time', ''], ['Skip checking the bus time and hope it waits', 'That ignores the changed deadline.'], ['Begin making a new breakfast recipe', PRIORITY]], 1, 'A strong revision protects the deadline and the essential steps.'),
      sequence('ffc-w4-c5', 'notebook', 'You have a blank page and need to plan a short report.', 'Order the planning moves.', ['Write the first paragraph', 'Choose the main idea', 'Review the assignment directions', 'List three supporting points'], [2, 1, 3, 0], 'Directions, main idea, supporting points, then drafting create a clear path.', 'Try again. Understand the assignment before choosing and building the report idea.'),
      choice('ffc-w4-c6', 'best_response', 'classroom', 'Your partner starts cutting poster pieces before the group agrees on the layout.', 'What planning response helps most?', [['Cut a different set of pieces at the same time', TOO_MANY], ['Pause, sketch the layout together, then divide jobs', ''], ['Let the partner finish and plan after', RUSHING], ['Organize markers without checking the poster directions', 'That prepares materials without confirming what the project needs.']], 1, 'A quick shared plan prevents duplicate work and makes roles clear.'),
      choice('ffc-w4-c7', 'time_estimation', 'timer', 'You estimate that packing sports gear takes two minutes, but it usually takes eight.', 'What should the next plan use?', [['Two minutes because that is the fastest possibility', 'That repeats an estimate that has not matched real experience.'], ['Eight to ten minutes based on what usually happens', ''], ['Twenty minutes without checking what is needed', 'That adds time without using useful evidence.'], ['No time estimate because packing is familiar', 'Familiar tasks still need space in a schedule.']], 1, 'Past experience gives the plan a realistic time window.'),
      choice('ffc-w4-c8', 'reflection', 'planner', 'Your plan worked, but you almost forgot the final review.', 'What should you change next time?', [['Add “review” as the last checklist step', ''], ['Make the plan longer without naming a review', 'That adds time but does not protect the missed step.'], ['Start earlier and skip the checklist', 'Starting earlier does not replace the missing review cue.'], ['Review halfway through and never at the end', 'A middle check helps, but the final result still needs a last review.']], 0, 'Putting review into the written plan makes it much harder to forget.'),
    ],
  },
  {
    id: 'focus-flame-week-5',
    week: 5,
    prerequisiteQuestId: 'quest-5',
    name: 'Time Detective',
    difficulty: 'intermediate',
    badge: 'Time Detective Badge',
    badgeProgressionValue: 1,
    skills: ['estimating time', 'planning ahead', 'deadlines', 'checking work'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'Every minute becomes more powerful when you use it wisely.',
    challenges: [
      choice('ffc-w5-c1', 'time_estimation', 'timer', 'A worksheet has 12 problems. Three problems took you six minutes.', 'What is the best estimate for all 12 at the same pace?', [['About 8 minutes', 'That estimate is too short for four groups of three problems.'], ['About 24 minutes', ''], ['Exactly 60 minutes', 'That estimate is much longer than the evidence suggests.'], ['No estimate until every problem is finished', 'An estimate is useful before the work is complete.']], 1, 'Four groups at about six minutes each gives a useful 24-minute estimate.'),
      choice('ffc-w5-c2', 'prioritization', 'planner', 'You have 30 minutes before practice. A 20-minute assignment is due tomorrow and a 10-minute room task is due this weekend.', 'How should you use the time?', [['Do the assignment first, then use remaining time for the room task', ''], ['Start the room task because it is shorter', PRIORITY], ['Alternate between both tasks every two minutes', TOO_MANY], ['Help a sibling with a nonurgent craft before either task', PRIORITY]], 0, 'The urgent assignment fits the window and should be protected first.'),
      sequence('ffc-w5-c3', 'checklist', 'You are estimating a new project with research, building, and review.', 'Order the time-detective steps.', ['Add a small buffer', 'Estimate each part', 'List the project parts', 'Compare the total with the deadline'], [2, 1, 0, 3], 'Breaking the work apart, estimating, buffering, and checking the deadline creates a realistic plan.', 'Try again. Identify the parts before estimating and comparing the full plan with the deadline.'),
      choice('ffc-w5-c4', 'plan_revision', 'notebook', 'Halfway through homework, you discover the reading section is twice as long as expected.', 'What is the best revision?', [['Keep the old finish time and rush every answer', RUSHING], ['Update the estimate, protect the due work, and move a flexible task', ''], ['Open another assignment so both can be partly done', TOO_MANY], ['Stop estimating because the first estimate was wrong', 'Estimates improve when new information is used.']], 1, 'A useful plan changes when better time information appears.'),
      choice('ffc-w5-c5', 'time_estimation', 'backpack', 'You must leave at 7:45. Getting dressed takes 10 minutes, breakfast 15, and packing 10.', 'What is the latest safe start with a five-minute buffer?', [['7:05', ''], ['7:20', 'That leaves too little time for all three tasks and the buffer.'], ['7:30', 'That only covers part of the routine.'], ['7:40', 'Five minutes cannot cover the full routine.']], 0, 'Thirty-five minutes of tasks plus a five-minute buffer means starting at 7:05.'),
      choice('ffc-w5-c6', 'best_response', 'classroom', 'You finish a quiz with four minutes left.', 'How should a Time Detective use the remaining time?', [['Turn it in immediately because finishing fast is the goal', RUSHING], ['Check unanswered items and review uncertain answers', ''], ['Begin drawing on the scratch paper', PRIORITY], ['Change every answer to use all four minutes', 'Review should use evidence, not automatic changes.']], 1, 'A focused check uses extra time to catch omissions and uncertain work.'),
      choice('ffc-w5-c7', 'reflection', 'timer', 'You predicted a task would take 15 minutes, but it took 25 because materials were missing.', 'What should you record for next time?', [['The task always takes exactly 25 minutes', 'One result helps, but future materials may change the time.'], ['Preparation needs its own time and checklist', ''], ['Time estimates never work', 'The mismatch gives useful information for a better estimate.'], ['Work faster without changing preparation', 'Speed does not solve missing materials.']], 1, 'Separating preparation time makes the next estimate more accurate.'),
      choice('ffc-w5-c8', 'checklist_building', 'planner', 'A project is due Monday, and you want a final check before submitting.', 'Which mini-schedule protects the deadline?', [['Finish Monday morning and check if time remains', RUSHING], ['Draft Saturday, revise Sunday, final check Sunday night', ''], ['Start three sections Sunday night at once', TOO_MANY], ['Organize the folder Saturday and begin the project Monday', PRIORITY]], 1, 'Finishing before the deadline leaves real time to revise and check.'),
    ],
  },
  {
    id: 'focus-flame-week-6',
    week: 6,
    prerequisiteQuestId: 'quest-6',
    name: 'Beat the Distraction',
    difficulty: 'intermediate',
    badge: 'Distraction Defender Badge',
    badgeProgressionValue: 1,
    skills: ['attention', 'impulse control', 'self-monitoring', 'returning focus'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'You defended your attention and returned to what mattered.',
    challenges: [
      choice('ffc-w6-c1', 'identify_distraction', 'notebook', 'While writing, you keep checking whether a game has finished downloading in another tab.', 'Which change handles the distraction?', [['Promise yourself not to look while leaving the tab visible', DISTRACTION], ['Close the game tab and keep only the writing window open', ''], ['Open both windows side by side', 'That keeps the visual cue competing with the writing.'], ['Check the download after every sentence', 'Frequent checking repeatedly breaks the writing flow.']], 1, 'Removing the cue makes the focused choice easier to repeat.'),
      choice('ffc-w6-c2', 'best_response', 'classroom', 'A friend asks a funny question while the teacher gives the final project direction.', 'What is the strongest response?', [['Answer quickly while listening to the teacher', 'Dividing attention risks missing the final direction.'], ['Signal “one minute,” listen, then answer the friend afterward', ''], ['Ask the friend another question before the teacher finishes', TOO_MANY], ['Ignore both voices and start packing', PRIORITY]], 1, 'Delaying the fun conversation protects the important direction without rejecting the friend.'),
      sequence('ffc-w6-c3', 'b4-technology', 'B-4 detects that your attention moved from homework to hallway noise.', 'Run the Distraction Defender sequence.', ['Return to the saved place', 'Change seats or reduce the noise', 'Name what pulled attention', 'Mark the exact place you paused'], [2, 3, 1, 0], 'Name it, save your place, change the environment, and return.', 'Try again. Protect your place before changing the environment so returning is easy.'),
      choice('ffc-w6-c4', 'plan_revision', 'timer', 'Your focus block is 25 minutes, but messages keep appearing on your watch.', 'What revision is most effective?', [['Try harder to ignore each vibration', DISTRACTION], ['Use focus mode and place the watch out of sight until the timer ends', ''], ['Shorten the work block to one minute', 'That avoids practicing sustained focus and may not fit the task.'], ['Reply to all messages before every problem', 'That lets the distraction control the work rhythm.']], 1, 'Changing both alerts and visibility reduces the repeated pull.'),
      choice('ffc-w6-c5', 'prioritization', 'camp', 'At camp, you are responsible for filling water bottles before the group leaves. A friend asks for help decorating a sign.', 'What should happen first?', [['Decorate because helping a friend feels important', PRIORITY], ['Finish the urgent water responsibility, then help if time remains', ''], ['Begin both and move back and forth', TOO_MANY], ['Organize the art supplies before checking the bottles', PRIORITY]], 1, 'Helping is valuable, but the urgent group responsibility must be secured first.'),
      choice('ffc-w6-c6', 'reflection', 'focus-flame', 'You stayed focused for 15 minutes after moving your phone across the room.', 'What did the strategy change?', [['It removed every thought about the phone', 'Strategies reduce pulls; they do not have to erase every thought.'], ['It added distance between the impulse and the action', ''], ['It made the assignment shorter', 'The amount of work did not change.'], ['It proved phones are always bad', 'The lesson is about managing a cue, not labeling the tool.']], 1, 'Distance created a pause where you could choose to keep working.'),
      choice('ffc-w6-c7', 'identify_distraction', 'planner', 'You have opened the planner, but you spend ten minutes choosing colors instead of writing tomorrow’s tasks.', 'What is the hidden distraction?', [['The planner has too many pages', 'That may affect setup, but the current delay is color choosing.'], ['Making the planner look perfect before using it', ''], ['Tomorrow has several tasks', 'Multiple tasks are the reason to plan, not the current distraction.'], ['Writing tasks takes too little time', 'The issue is avoiding the useful step, not its length.']], 1, 'Perfection can become a distraction when it delays the planner’s real job.'),
      choice('ffc-w6-c8', 'best_response', 'notebook', 'You notice you have read the same paragraph three times while thinking about recess.', 'What should you do?', [['Keep rereading at the same speed', DISTRACTION], ['Pause, summarize the last clear idea, then read the next sentence', ''], ['Skip to the end and guess the meaning', RUSHING], ['Start highlighting every word', 'That adds activity without checking understanding.']], 1, 'A quick summary finds your place and gives attention a clear restart point.'),
    ],
  },
  {
    id: 'focus-flame-week-7',
    week: 7,
    prerequisiteQuestId: 'quest-7',
    name: 'Mission Organizer',
    difficulty: 'intermediate',
    badge: 'Organization Expert Badge',
    badgeProgressionValue: 1,
    skills: ['organization', 'checklists', 'materials management', 'planning ahead'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'Your systems kept materials, steps, and responsibilities ready.',
    challenges: [
      choice('ffc-w7-c1', 'checklist_building', 'backpack', 'Tomorrow includes art, library, and soccer practice.', 'Which packing checklist is most reliable?', [['Sketchbook, library book, soccer shoes, water bottle', ''], ['Everything from the bedroom floor', 'A large unsorted pile can still miss the required items.'], ['Only the easiest item to remember', 'One item does not cover the day’s different needs.'], ['Pack first, then check the schedule after school', RUSHING]], 0, 'Matching the checklist to the schedule keeps each activity supplied.'),
      sequence('ffc-w7-c2', 'checklist', 'Your desk has mixed papers, supplies, and finished work.', 'Order a useful organization reset.', ['Put current materials in their labeled places', 'Separate keep, submit, and recycle papers', 'Check that tomorrow’s needed items are accessible', 'Read the labels and identify each zone'], [3, 1, 0, 2], 'Know the zones, sort decisions, place materials, then check tomorrow’s access.', 'Try again. Identify the system before sorting and finish with a readiness check.'),
      choice('ffc-w7-c3', 'prioritization', 'notebook', 'Your folder contains a due-today form, old drawings, and next week’s vocabulary list.', 'What should you handle first?', [['Redraw the old pictures neatly', PRIORITY], ['Place the due-today form where it will be submitted', ''], ['Start decorating the vocabulary list', PRIORITY], ['Empty every folder onto the floor', 'That creates a bigger sorting job before securing the urgent item.']], 1, 'Protecting the due item first prevents organization work from hiding the deadline.'),
      choice('ffc-w7-c4', 'plan_revision', 'camp', 'At camp setup, the supply checklist says six cones, but only four are in the bin.', 'What should the organizer do?', [['Mark six because the list expected six', 'A checklist should record what is actually verified.'], ['Report the shortage and revise the setup plan with the leader', ''], ['Start a different station without telling anyone', PRIORITY], ['Spread the four cones farther apart and hide the shortage', 'That changes safety or layout without approval.']], 1, 'Reporting the verified shortage lets the team make a safe plan.'),
      choice('ffc-w7-c5', 'best_response', 'planner', 'You use three different places to record homework and keep missing one.', 'What system is strongest?', [['Choose one main planner and check it at the same times daily', ''], ['Add a fourth place as a backup', 'More locations increase the chance of missing one.'], ['Remember the hardest assignments without writing them', 'Memory alone is less reliable than one visible system.'], ['Rewrite every task whenever you change rooms', 'Repeated copying adds work and can introduce errors.']], 0, 'One trusted capture place and a check routine make the system dependable.'),
      choice('ffc-w7-c6', 'reflection', 'checklist', 'A checklist helped you remember supplies, but you still forgot to bring the packed bag.', 'What system needs improvement?', [['The item list', 'The supplies were remembered and packed.'], ['The final “place bag by the door” cue', ''], ['The spelling on the checklist', 'Spelling was not what prevented the bag from moving.'], ['The number of supplies', 'The issue happened after packing, not during counting.']], 1, 'Organization includes the final transition, not only the materials list.'),
      choice('ffc-w7-c7', 'identify_distraction', 'classroom', 'You are labeling folders but keep redesigning each label instead of sorting papers.', 'What is getting in the way?', [['Making labels perfect instead of finishing the system', ''], ['The papers belong to different subjects', 'Different subjects are exactly what the labels help organize.'], ['The folders open from the top', 'That does not explain the repeated redesign.'], ['Sorting will make the desk less colorful', 'That is not the current action delaying the task.']], 0, 'A simple usable label is better than a perfect label that delays sorting.'),
      sequence('ffc-w7-c8', 'planner', 'You need a weekly system for assignments and materials.', 'Build the system in order.', ['Pack materials for the next day', 'Review upcoming deadlines', 'Record new assignments in one place', 'Check off completed work'], [2, 3, 1, 0], 'Capture, complete, review ahead, and pack for tomorrow creates a repeatable loop.', 'Try again. New work must enter the system before it can be checked, reviewed, and packed.'),
    ],
  },
  {
    id: 'focus-flame-week-8',
    week: 8,
    prerequisiteQuestId: 'quest-8',
    name: 'Finish Strong',
    difficulty: 'advanced',
    badge: 'Perseverance Badge',
    badgeProgressionValue: 1,
    skills: ['perseverance', 'reviewing work', 'motivation', 'mistake checking'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'You kept going, checked your work, and finished with care.',
    challenges: [
      choice('ffc-w8-c1', 'best_response', 'notebook', 'Your draft is almost finished, but the last paragraph feels difficult and you want to start a different project.', 'What helps you finish strong?', [['Open the new project for a quick break', 'A new project may become another unfinished task.'], ['Write a rough final paragraph, then revise it', ''], ['Reformat every earlier paragraph first', PRIORITY], ['Submit without the last paragraph', RUSHING]], 1, 'A rough complete version gives you something real to improve.'),
      choice('ffc-w8-c2', 'plan_revision', 'timer', 'You have 15 minutes left and three review steps that usually take 10 minutes each.', 'What is the strongest revision?', [['Rush all three steps in five minutes each', RUSHING], ['Choose the highest-risk check now and schedule the remaining checks before submission', ''], ['Skip review because the original plan no longer fits', 'A changed plan still needs the most valuable check.'], ['Start adding a new section to make the work stronger', PRIORITY]], 1, 'Prioritizing the riskiest check protects quality while creating a realistic follow-up plan.'),
      sequence('ffc-w8-c3', 'checklist', 'You finished a presentation and need a final quality check.', 'Order the finish-strong routine.', ['Fix the most important issue', 'Run the presentation once', 'Submit the final version', 'Check directions and success criteria'], [3, 1, 0, 2], 'Criteria, test, repair, then submit turns finishing into a quality process.', 'Try again. Check the target before testing, fixing, and submitting.'),
      choice('ffc-w8-c4', 'reflection', 'focus-flame', 'You wanted to stop after a mistake, but a five-minute restart helped you continue.', 'What did perseverance look like?', [['Never feeling frustrated', 'Perseverance can happen while frustration is present.'], ['Using a small restart instead of waiting to feel perfect', ''], ['Pretending the mistake did not happen', 'Ignoring the mistake does not help the work improve.'], ['Working without any break for the rest of the day', 'Perseverance does not require exhausting yourself.']], 1, 'A manageable restart keeps progress moving even when motivation is low.'),
      choice('ffc-w8-c5', 'identify_distraction', 'planner', 'Near the end of a project, you keep adding optional details and miss time for the required conclusion.', 'What is the distraction?', [['The conclusion is part of the project', 'That is the required step being delayed.'], ['Optional polishing before required work is complete', ''], ['The project has a deadline', 'The deadline helps identify what must be finished.'], ['The planner shows remaining time', 'The planner is useful evidence, not the distraction.']], 1, 'Optional polish can pull attention away from required completion.'),
      choice('ffc-w8-c6', 'prioritization', 'classroom', 'Your group has one class period left. The facts need checking, the title could be prettier, and the border is unfinished.', 'What comes first?', [['Check the facts used in the presentation', ''], ['Redesign the title', PRIORITY], ['Finish the border', PRIORITY], ['Begin all three jobs before assigning roles', TOO_MANY]], 0, 'Accuracy affects the meaning of the project and outranks decoration.'),
      choice('ffc-w8-c7', 'best_response', 'b4-technology', 'B-4 flags one possible error after you already reviewed the work once.', 'What should you do?', [['Ignore it because one review is enough', 'A second signal deserves a focused check.'], ['Check the flagged part against the directions, then correct it if needed', ''], ['Restart the entire project without checking the flag', 'That uses a lot of effort before locating the issue.'], ['Change the answer immediately without reviewing evidence', RUSHING]], 1, 'A targeted evidence check protects effort and catches real mistakes.'),
      choice('ffc-w8-c8', 'reflection', 'notebook', 'You completed a long assignment by using three short work blocks.', 'Which lesson supports future motivation?', [['Long work only counts when finished in one sitting', 'That ignores the successful structure you used.'], ['Small completed blocks can build a large finished result', ''], ['Breaks always make work take longer', 'Planned breaks helped you return and complete the work.'], ['The assignment was finished only because it became easier', 'That overlooks the persistence strategy.']], 1, 'Visible small wins can carry motivation through a longer task.'),
    ],
  },
  {
    id: 'focus-flame-week-9',
    week: 9,
    prerequisiteQuestId: 'quest-9',
    name: 'Focus Champion',
    difficulty: 'advanced',
    badge: 'Focus Champion Badge',
    badgeProgressionValue: 1,
    skills: ['planning', 'organization', 'emotional regulation', 'prioritization', 'time management', 'persistence'],
    status: 'published',
    gradeSupport: { primary: '3-6', adaptations: {} },
    completionMessage: 'You’ve learned how to plan, recover, organize, and finish strong.',
    challenges: [
      sequence('ffc-w9-c1', 'camp', 'Your camp team has 40 minutes to gather gear, check a route, and reach the starting point. One teammate is worried about a missing safety item.', 'Build the best multi-step launch plan.', ['Travel to the starting point', 'Confirm the required safety list', 'Assign gear and route-check roles', 'Report and replace the missing safety item'], [1, 2, 3, 0], 'Confirm safety, organize roles, repair the gap, then launch.', 'Try again. Safety requirements and roles must be clear before the team replaces missing gear and travels.'),
      choice('ffc-w9-c2', 'prioritization', 'planner', 'A report is due tomorrow, practice begins in an hour, and a friend wants help with next week’s project.', 'What is the strongest plan?', [['Help the friend first because helping matters', PRIORITY], ['Finish the due report block, prepare for practice, then schedule friend-help time', ''], ['Start the report, practice prep, and friend project together', TOO_MANY], ['Organize next week’s materials before checking tomorrow’s deadline', PRIORITY]], 1, 'The plan protects the nearest deadline and fixed commitment while still making room to help.'),
      choice('ffc-w9-c3', 'plan_revision', 'timer', 'Twenty minutes into a team build, a required part breaks. The deadline stays the same and everyone feels frustrated.', 'What should the Focus Champion do?', [['Keep the original plan and work faster', RUSHING], ['Pause, regulate, identify the essential goal, and assign a repair plan', ''], ['Begin a second design while the first remains unfinished', TOO_MANY], ['Spend the remaining time organizing unused supplies', PRIORITY]], 1, 'A brief reset plus a goal-based revision helps the team respond instead of react.'),
      sequence('ffc-w9-c4', 'b4-technology', 'B-4 gives you a complex homework mission: two assignments, a device that needs charging, and one unclear direction.', 'Order the staged decisions.', ['Complete and review the highest-priority assignment', 'Clarify the uncertain direction', 'List deadlines and required materials', 'Start charging the device while you plan'], [2, 3, 1, 0], 'Map the mission, start passive preparation, remove uncertainty, then complete and review the priority.', 'Try again. First understand deadlines and materials, then use waiting time, clarify the blocker, and work the priority.'),
      choice('ffc-w9-c5', 'identify_distraction', 'notebook', 'You are revising an important essay but keep searching for new examples even though the assignment already has enough evidence.', 'What executive-function trap is happening?', [['Useful research always improves a finished draft', 'More information is not automatically the most important next step.'], ['Extra research is delaying the required revision and finish', ''], ['The essay needs no review because it has examples', 'Examples do not replace a full quality check.'], ['The deadline should be ignored until the research feels complete', 'That lets an open-ended activity replace a fixed responsibility.']], 1, 'A Focus Champion notices when “more” work is replacing the right finishing work.'),
      choice('ffc-w9-c6', 'time_estimation', 'planner', 'Your project needs 25 minutes to finish, 15 to review, and 10 to upload. The upload deadline is in 45 minutes.', 'What is the best response?', [['Begin now and hope every estimate is high', 'The plan already needs 50 minutes, so hoping does not solve the gap.'], ['Ask about the deadline immediately and prioritize a complete, reviewed version while preparing the upload', ''], ['Use all 45 minutes finishing and skip upload planning', 'That ignores a required step and creates a deadline failure.'], ['Open another task while deciding what to cut', TOO_MANY]], 1, 'The estimate reveals a five-minute gap early enough to communicate and protect essential quality.'),
      choice('ffc-w9-c7', 'reflection', 'focus-flame', 'Across several missions, you learned that frustration often makes you rush.', 'Which personal plan shows self-awareness?', [['“When frustration rises, I will pause, name the next step, and check before submitting.”', ''], ['“I will never feel frustrated during important work.”', 'A plan should work with real feelings, not require them to disappear.'], ['“I will start several tasks so one always feels easy.”', TOO_MANY], ['“I will organize materials whenever a task feels difficult.”', 'Organization helps only when it supports the actual next step.']], 0, 'The plan connects a known signal with a specific reset and review action.'),
      choice('ffc-w9-c8', 'best_response', 'checklist', 'You have followed a long plan, completed every required part, and found one small mistake during the final check.', 'What does finishing like a champion look like?', [['Submit the earlier version because the plan is technically complete', RUSHING], ['Correct the mistake, confirm the saved version, and submit', ''], ['Restart the whole project to make sure nothing else is wrong', 'A targeted correction and confirmation is more efficient than restarting.'], ['Add an optional feature before fixing the mistake', PRIORITY]], 1, 'Finishing strong means using the final check, saving the correction, and completing the submission.'),
    ],
  },
];

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;
const accentByIllustration: Record<FocusFlameIllustrationKey, CaidenQuestAccent> = {
  backpack: 'camp-pack',
  classroom: 'attention-return',
  notebook: 'reflection',
  planner: 'weekly-plan',
  timer: 'timer',
  checklist: 'responsible-choice',
  'focus-flame': 'focus-reset',
  'b4-technology': 'distraction',
  camp: 'camp-pack',
};

function challengeMeta(mission: FocusFlameChallengeMission, challenge: FocusFlameChallenge) {
  return {
    week: mission.week,
    missionName: mission.name,
    difficulty: mission.difficulty,
    interactionType: challenge.interactionType,
    illustrationKey: challenge.illustrationKey,
    badgeProgressionValue: mission.badgeProgressionValue,
    status: mission.status,
  } as const;
}

function buildQuestion(mission: FocusFlameChallengeMission, challenge: FocusFlameChallenge): GameQuestion {
  const base = {
    id: challenge.id,
    prompt: challenge.prompt,
    question: challenge.prompt,
    story: challenge.scenario,
    clueCard: {
      variant: 'focus_quest' as const,
      label: 'Real-Life Challenge',
      tag: challenge.interactionType.replace(/_/g, ' ').toUpperCase(),
      text: challenge.scenario,
      accent: accentByIllustration[challenge.illustrationKey],
      imageSrc: CAIDEN_SCENARIO_ICON_SRC,
    },
    skillTags: mission.skills,
    feedbackCorrect: challenge.correctFeedback,
    correctFeedback: challenge.correctFeedback,
    hints: ['Look for the choice that protects the goal and makes the next step clear.'],
    feedbackDetailCorrect: { whyItMatters: challenge.correctFeedback },
    challengeMeta: challengeMeta(mission, challenge),
  };

  if (challenge.kind === 'sequence') {
    const ids = CHOICE_IDS;
    const question: GameSequenceQuestion = {
      ...base,
      type: 'sequence_order',
      items: challenge.items.map((label, index) => ({ id: ids[index], label })),
      correctOrder: challenge.correctOrder.map((index) => ids[index]),
      feedbackIncorrect: challenge.incorrectFeedback,
      incorrectFeedback: challenge.incorrectFeedback,
      feedbackDetailIncorrect: { whyItMatters: challenge.incorrectFeedback },
    };
    return question;
  }

  const defaultIncorrect = 'That choice is believable, but another response protects the goal more directly.';
  const question: GameChoiceQuestion = {
    ...base,
    type:
      challenge.interactionType === 'identify_distraction'
        ? 'observation'
        : challenge.interactionType === 'reflection'
          ? 'select_clue'
          : 'multiple_choice',
    options: challenge.choices.map(([label, feedback], index) => ({
      id: CHOICE_IDS[index],
      label,
      incorrectFeedback: index === challenge.correctIndex ? undefined : feedback || defaultIncorrect,
    })),
    correctId: CHOICE_IDS[challenge.correctIndex],
    feedbackIncorrect: defaultIncorrect,
    incorrectFeedback: defaultIncorrect,
    feedbackDetailIncorrect: { whyItMatters: defaultIncorrect },
  };
  return question;
}

export function buildFocusFlameChallengeConfig(
  mission: FocusFlameChallengeMission,
): GameAssessmentConfig {
  return {
    id: mission.id,
    fileNumber: mission.week,
    decorVariant: 'caiden',
    presentationStyle: 'focus_quest',
    shellClassName: 'caiden-game',
    ...CAIDEN_MISSION_AVATAR,
    landing: {
      eyebrow: `WEEK ${mission.week} · FOCUS FLAME CHALLENGE`,
      title: mission.name,
      subtitle: `${mission.difficulty[0].toUpperCase()}${mission.difficulty.slice(1)} · Grades ${mission.gradeSupport.primary}`,
      body: 'Practice real-life choices that help you plan, recover, organize, and finish.',
      cta: 'Start Challenge',
    },
    complete: {
      title: `${mission.name} Complete!`,
      message: mission.completionMessage,
      badges: [mission.badge],
    },
    questions: mission.challenges.map((challenge) => buildQuestion(mission, challenge)),
    tracking: {
      moduleId: mission.id,
      moduleTitle: mission.name,
      character: 'caiden',
      audience: 'student',
      role: 'student',
      skillArea: mission.skills[0].replace(/\s+/g, '-'),
    },
  };
}

export const FOCUS_FLAME_CHALLENGE_CONFIGS: Record<string, GameAssessmentConfig> =
  Object.fromEntries(
    FOCUS_FLAME_CHALLENGE_MISSIONS.map((mission) => [
      mission.id,
      buildFocusFlameChallengeConfig(mission),
    ]),
  );

export function getFocusFlameChallengeMission(id: string | undefined) {
  if (!id) return undefined;
  return FOCUS_FLAME_CHALLENGE_MISSIONS.find((mission) => mission.id === id);
}

export function getFocusFlameChallengeConfig(id: string | undefined) {
  if (!id) return undefined;
  return FOCUS_FLAME_CHALLENGE_CONFIGS[id];
}

export function resolveFocusFlameChallengeAvailability(input: {
  prerequisiteStatus: 'available' | 'active' | 'locked' | 'completed' | undefined;
  completed: boolean;
}): 'locked' | 'available' | 'completed' {
  if (input.completed) return 'completed';
  if (!input.prerequisiteStatus || input.prerequisiteStatus === 'locked') return 'locked';
  return 'available';
}

for (const mission of FOCUS_FLAME_CHALLENGE_MISSIONS) {
  const tracking = FOCUS_FLAME_CHALLENGE_CONFIGS[mission.id]?.tracking;
  if (tracking) registerModuleTracking(tracking);
}
