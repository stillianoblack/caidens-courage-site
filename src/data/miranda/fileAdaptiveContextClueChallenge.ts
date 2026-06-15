import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_CONTEXT_CLUE_CHALLENGE_ID = 'the-context-clue-challenge';

export const MIRANDA_CONTEXT_CLUE_CHALLENGE_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_CONTEXT_CLUE_CHALLENGE_ID,
  title: 'The Context Clue Challenge',
  character: 'miranda',
  fileNumber: 5,
  skillFocus: ['Vocabulary', 'Context Clues', 'Inference'],
  presentationStyle: 'case_file',
  landing: {
    eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
    title: "Miranda's Mystery Files",
    subtitle: 'The Context Clue Challenge',
    body: 'Use context clues from each case note to unlock the meaning of important detective words.',
    cta: 'Open Notebook',
  },
  complete: {
    title: 'Notebook Complete',
    message: 'Miranda decoded every detective word using context clues. Great vocabulary work!',
    badges: ['Context Clue Detective', 'Vocabulary Explorer', 'Focus Flame Investigator'],
  },
  gradeContent: {
    'K-1': {
      dashboardTitle: 'The Context Clue Challenge',
      dashboardDescription: 'Use clues in the sentence to learn new words.',
      scenarioEyebrow: 'NOTEBOOK ENTRY',
      passage:
        'Miranda looked closely at the poster on the wall. She did not just glance. She examined every corner to find a hidden clue.',
      skillTags: ['Vocabulary', 'Context Clues'],
      questions: [
        {
          id: 'mcc-k1-q1',
          question: 'According to the passage, what did Miranda do to the poster?',
          options: [
            { id: 'a', label: 'She looked at it closely' },
            { id: 'b', label: 'She tore it down' },
            { id: 'c', label: 'She ignored it' },
            { id: 'd', label: 'She painted it' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda examined every corner, which means she looked closely.',
          hint: 'She did not just glance.',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mcc-k1-q2',
          question: 'Which clue best supports what "examined" means?',
          options: [
            { id: 'a', label: 'She looked at every corner' },
            { id: 'b', label: 'She ran away' },
            { id: 'c', label: 'She ate a snack' },
            { id: 'd', label: 'She closed her eyes' },
          ],
          correctAnswer: 'a',
          explanation: 'Looking at every corner shows examined means looked closely.',
          hint: 'What did Miranda do right after the word examined?',
          skillTags: ['Context Clues', 'Vocabulary'],
        },
        {
          id: 'mcc-k1-q3',
          question: 'What was Miranda trying to find?',
          options: [
            { id: 'a', label: 'A hidden clue' },
            { id: 'b', label: 'A new backpack' },
            { id: 'c', label: 'A lunch box' },
            { id: 'd', label: 'A rain coat' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda examined the poster to find a hidden clue.',
          hint: 'What kind of detective item was she searching for?',
          skillTags: ['Reading Comprehension'],
        },
      ],
    },
    '2-3': {
      dashboardTitle: 'The Context Clue Challenge',
      dashboardDescription: 'Figure out detective words using nearby clues.',
      scenarioEyebrow: 'NOTEBOOK ENTRY',
      passage:
        'Miranda carefully examined the poster taped near the bulletin board. The clue seemed unusual because the drawing did not match anything she had seen before. She wrote in her notebook that unusual means different from what you expect.',
      skillTags: ['Vocabulary', 'Context Clues'],
      questions: [
        {
          id: 'mcc-23-q1',
          question: 'According to the passage, why did the clue seem unusual?',
          options: [
            { id: 'a', label: 'The drawing did not match anything Miranda had seen' },
            { id: 'b', label: 'The poster was the same as always' },
            { id: 'c', label: 'Miranda forgot her notebook' },
            { id: 'd', label: 'The bell had not rung yet' },
          ],
          correctAnswer: 'a',
          explanation: 'The clue stood out because the drawing was unfamiliar.',
          hint: 'What made the clue different?',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mcc-23-q2',
          question: 'Which clue best supports what "unusual" means?',
          options: [
            { id: 'a', label: 'Different from what you expect' },
            { id: 'b', label: 'Easy to carry' },
            { id: 'c', label: 'Very loud' },
            { id: 'd', label: 'Already solved' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda wrote that unusual means different from what you expect.',
          hint: 'Look at what Miranda wrote in her notebook.',
          skillTags: ['Vocabulary'],
        },
        {
          id: 'mcc-23-q3',
          question: 'What does "examined" mean in the passage?',
          options: [
            { id: 'a', label: 'Looked at closely' },
            { id: 'b', label: 'Ignored completely' },
            { id: 'c', label: 'Threw away' },
            { id: 'd', label: 'Hid under a desk' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda examined the poster carefully, so she looked at it closely.',
          hint: 'How did Miranda study the poster?',
          skillTags: ['Vocabulary', 'Context Clues'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: 'The Context Clue Challenge',
      dashboardDescription: 'Use sentence clues to define important investigation words.',
      scenarioEyebrow: 'NOTEBOOK ENTRY',
      passage:
        'The campers searched the room for evidence after the schedule disappeared. Miranda hesitated before opening a sealed envelope because she wanted to follow the rules. Her facilitator reminded her that evidence means proof or clues that help solve a mystery.',
      skillTags: ['Vocabulary', 'Context Clues', 'Inference'],
      questions: [
        {
          id: 'mcc-45-q1',
          question: 'According to the passage, what were the campers searching for?',
          options: [
            { id: 'a', label: 'Evidence' },
            { id: 'b', label: 'Lunch menus' },
            { id: 'c', label: 'New shoes' },
            { id: 'd', label: 'Art supplies only' },
          ],
          correctAnswer: 'a',
          explanation: 'The campers searched the room for evidence after the schedule disappeared.',
          hint: 'What detective item were they looking for?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mcc-45-q2',
          question: 'Which clue best supports what "evidence" means?',
          options: [
            { id: 'a', label: 'Proof or clues that help solve a mystery' },
            { id: 'b', label: 'A reward for finishing early' },
            { id: 'c', label: 'A type of backpack' },
            { id: 'd', label: 'A classroom rule' },
          ],
          correctAnswer: 'a',
          explanation: 'The facilitator defined evidence as proof or clues for solving a mystery.',
          hint: 'What did the facilitator say evidence means?',
          skillTags: ['Vocabulary', 'Context Clues'],
        },
        {
          id: 'mcc-45-q3',
          question: 'What does "hesitated" suggest about Miranda?',
          options: [
            { id: 'a', label: 'She paused because she wanted to follow the rules' },
            { id: 'b', label: 'She ran away from the room' },
            { id: 'c', label: 'She already knew the answer' },
            { id: 'd', label: 'She refused to help' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda paused before opening the envelope to make a careful, rule-following choice.',
          hint: 'Why did she wait before opening the envelope?',
          skillTags: ['Inference', 'Vocabulary'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: 'The Context Clue Challenge',
      dashboardDescription: 'Analyze context to define advanced detective vocabulary.',
      scenarioEyebrow: 'NOTEBOOK ENTRY',
      passage:
        'Miranda reviewed a case summary where the suspect\'s alibi seemed plausible at first. However, one witness contradicted the timeline, and Miranda had to scrutinize each detail before drawing a conclusion. She noted that plausible means believable and contradict means to say the opposite.',
      skillTags: ['Vocabulary', 'Analysis', 'Context Clues'],
      questions: [
        {
          id: 'mcc-68-q1',
          question: 'According to the passage, what made Miranda scrutinize the details?',
          options: [
            { id: 'a', label: 'A witness contradicted the timeline' },
            { id: 'b', label: 'The case was already closed' },
            { id: 'c', label: 'Miranda lost her notebook' },
            { id: 'd', label: 'No one gave any information' },
          ],
          correctAnswer: 'a',
          explanation: 'The conflicting witness account made Miranda examine each detail carefully.',
          hint: 'What problem appeared in the case summary?',
          skillTags: ['Reading Comprehension', 'Inference'],
        },
        {
          id: 'mcc-68-q2',
          question: 'Which clue best supports what "plausible" means?',
          options: [
            { id: 'a', label: 'Believable at first' },
            { id: 'b', label: 'Completely impossible' },
            { id: 'c', label: 'Hidden under a table' },
            { id: 'd', label: 'Written in another language' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda noted that plausible means believable, which fits the alibi at first.',
          hint: 'What did Miranda write about plausible?',
          skillTags: ['Vocabulary', 'Context Clues'],
        },
        {
          id: 'mcc-68-q3',
          question: 'What does "contradict" mean in this case?',
          options: [
            { id: 'a', label: 'Say the opposite' },
            { id: 'b', label: 'Agree completely' },
            { id: 'c', label: 'Forget the facts' },
            { id: 'd', label: 'Hide the notebook' },
          ],
          correctAnswer: 'a',
          explanation: 'To contradict means to go against or say the opposite of another account.',
          hint: 'How would a witness change the timeline story?',
          skillTags: ['Vocabulary', 'Analysis'],
        },
      ],
    },
  },
};

registerMirandaAdaptiveFile(MIRANDA_CONTEXT_CLUE_CHALLENGE_FILE);
