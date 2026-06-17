import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_MISSING_CLUE_ID = 'miranda-mystery-file-3';

export const MIRANDA_MISSING_CLUE_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_MISSING_CLUE_ID,
  title: 'The Missing Clue',
  character: 'miranda',
  fileNumber: 3,
  skillFocus: ['Context Clues', 'Vocabulary', 'Inference'],
  presentationStyle: 'case_file',
  landing: {
    eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Clue',
    body: 'A clue note has a missing word. Use pictures and context to solve it.',
    cta: 'Open Case',
  },
  complete: {
    title: 'Clue Completed',
    message: 'Miranda used context clues to finish the note. Case closed!',
    badges: ['Word Detective', 'Context Clue Pro'],
  },
  gradeContent: {
    '2-3': {
      dashboardTitle: 'The Missing Clue',
      dashboardDescription: 'Read a short clue and answer what happened.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda found a note with one word missing. The note said, "Meet by the ____ after lunch." She looked at the picture beside the note. It showed a tree. Miranda knew the missing word was tree.',
      skillTags: ['Context Clues', 'Vocabulary'],
      questions: [
        {
          id: 'mcl-23-q1',
          question: 'What was missing from the note?',
          options: [
            { id: 'a', label: 'A word' },
            { id: 'b', label: 'A pencil' },
            { id: 'c', label: 'A backpack' },
            { id: 'd', label: 'A snack' },
          ],
          correctAnswer: 'a',
          explanation: 'One word in the note was blank.',
          hint: 'Look at the blank in the sentence.',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mcl-23-q2',
          question: 'What picture helped Miranda?',
          options: [
            { id: 'a', label: 'A tree' },
            { id: 'b', label: 'A chair' },
            { id: 'c', label: 'A shoe' },
            { id: 'd', label: 'A clock' },
          ],
          correctAnswer: 'a',
          explanation: 'The picture showed a tree, which helped Miranda know the missing word.',
          hint: 'What did Miranda see beside the note?',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mcl-23-q3',
          question: 'What word completed the note?',
          options: [
            { id: 'a', label: 'tree' },
            { id: 'b', label: 'lunch' },
            { id: 'c', label: 'book' },
            { id: 'd', label: 'door' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda knew the missing word was tree.',
          hint: 'Match the picture to the blank.',
          skillTags: ['Vocabulary'],
        },
        {
          id: 'mcl-23-q4',
          question: 'When were they supposed to meet?',
          options: [
            { id: 'a', label: 'Before school' },
            { id: 'b', label: 'After lunch' },
            { id: 'c', label: 'At bedtime' },
            { id: 'd', label: 'During math class' },
          ],
          correctAnswer: 'b',
          explanation:
            'The note says "Meet by the ____ after lunch," so the meeting time is after lunch.',
          hint: 'Read the end of the sentence on the note.',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mcl-23-q5',
          question: 'How did Miranda figure out the missing word?',
          options: [
            { id: 'a', label: 'She picked a word at random' },
            { id: 'b', label: 'She asked everyone to vote' },
            { id: 'c', label: 'She matched the picture to the blank' },
            { id: 'd', label: 'She threw the note away' },
          ],
          correctAnswer: 'c',
          explanation:
            'Miranda looked at the tree picture beside the note and matched it to the blank.',
          hint: 'What clue was right next to the sentence?',
          skillTags: ['Context Clues', 'Inference'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: 'The Missing Clue',
      dashboardDescription: 'Use details from the clue to solve what happened.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda found a clue note on the floor. One word had been smudged: "Meet by the ____ after lunch." Next to the sentence was a small drawing of branches and leaves. Miranda compared the drawing to places around the school and realized the note probably pointed to the tree near the playground.',
      skillTags: ['Context Clues', 'Vocabulary', 'Inference'],
      questions: [
        {
          id: 'mcl-45-q1',
          question: 'What helped Miranda figure out the missing word?',
          options: [
            { id: 'a', label: 'The drawing of branches and leaves' },
            { id: 'b', label: 'A loud bell' },
            { id: 'c', label: 'A lunch tray' },
            { id: 'd', label: 'A classroom door' },
          ],
          correctAnswer: 'a',
          explanation: 'The drawing of branches and leaves pointed to a tree.',
          hint: 'What visual clue was beside the note?',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mcl-45-q2',
          question: 'What does “smudged” mean?',
          options: [
            { id: 'a', label: 'Blurry or rubbed away' },
            { id: 'b', label: 'Very loud' },
            { id: 'c', label: 'Easy to hear' },
            { id: 'd', label: 'Carefully folded' },
          ],
          correctAnswer: 'a',
          explanation: 'Smudged means the word was hard to read because it was rubbed or blurry.',
          hint: 'The word could not be read clearly.',
          skillTags: ['Vocabulary'],
        },
        {
          id: 'mcl-45-q3',
          question: 'Where did the clue probably point?',
          options: [
            { id: 'a', label: 'The tree near the playground' },
            { id: 'b', label: 'The cafeteria sink' },
            { id: 'c', label: 'The library desk' },
            { id: 'd', label: 'The gym closet' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda connected the tree drawing to the tree near the playground.',
          hint: 'Where would branches and leaves be found?',
          skillTags: ['Inference'],
        },
        {
          id: 'mcl-45-q4',
          question: 'What did Miranda compare the drawing to?',
          options: [
            { id: 'a', label: 'Sounds in the hallway' },
            { id: 'b', label: 'Places around the school' },
            { id: 'c', label: 'Her lunch tray' },
            { id: 'd', label: 'A math worksheet' },
          ],
          correctAnswer: 'b',
          explanation:
            'Miranda compared the drawing to places around the school to find the meeting spot.',
          hint: 'How did she connect the picture to a real location?',
          skillTags: ['Context Clues', 'Inference'],
        },
        {
          id: 'mcl-45-q5',
          question: 'What kind of word fits the blank in "Meet by the ____"?',
          options: [
            { id: 'a', label: 'A number' },
            { id: 'b', label: 'A color' },
            { id: 'c', label: 'A person\'s name only' },
            { id: 'd', label: 'A place word' },
          ],
          correctAnswer: 'd',
          explanation:
            'The blank needs a place word because the sentence tells where to meet.',
          hint: 'Think about what "meet by" is asking for.',
          skillTags: ['Vocabulary', 'Context Clues'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: 'The Missing Clue',
      dashboardDescription: 'Analyze evidence and make an inference from the clue.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda discovered a clue note with a partially smudged location: "Meet by the ____ after lunch." Although the missing word was unreadable, a small sketch beside the sentence showed branches, leaves, and a curved trunk. Miranda used context clues from both the sentence and the drawing to infer that the intended meeting place was the old tree near the playground.',
      skillTags: ['Context Clues', 'Vocabulary', 'Analysis'],
      questions: [
        {
          id: 'mcl-68-q1',
          question: 'Which clue most strongly supports the answer?',
          options: [
            { id: 'a', label: 'The sketch of branches, leaves, and trunk' },
            { id: 'b', label: 'The word lunch' },
            { id: 'c', label: 'The note being on the floor' },
            { id: 'd', label: 'The sentence being short' },
          ],
          correctAnswer: 'a',
          explanation: 'The sketch directly suggests a tree as the meeting place.',
          hint: 'Which clue describes a physical place?',
          skillTags: ['Evidence', 'Analysis'],
        },
        {
          id: 'mcl-68-q2',
          question: 'What strategy did Miranda use?',
          options: [
            { id: 'a', label: 'Context clues' },
            { id: 'b', label: 'Using one clue without checking others' },
            { id: 'c', label: 'Ignoring evidence' },
            { id: 'd', label: 'Asking everyone to stop' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda combined the sentence and drawing as context clues.',
          hint: 'She used more than one piece of information.',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mcl-68-q3',
          question: 'What does “intended” mean here?',
          options: [
            { id: 'a', label: 'Planned or meant' },
            { id: 'b', label: 'Forgotten' },
            { id: 'c', label: 'Missing from view for now' },
            { id: 'd', label: 'Broken' },
          ],
          correctAnswer: 'a',
          explanation: 'Intended means the place someone planned to meet.',
          hint: 'Think about what the note writer meant to say.',
          skillTags: ['Vocabulary'],
        },
        {
          id: 'mcl-68-q4',
          question: 'Why was the missing word hard to read?',
          options: [
            { id: 'a', label: 'The note was torn in half' },
            { id: 'b', label: 'It was partially smudged' },
            { id: 'c', label: 'Miranda lost her glasses' },
            { id: 'd', label: 'The classroom lights were off' },
          ],
          correctAnswer: 'b',
          explanation:
            'The passage describes the location word as partially smudged and unreadable.',
          hint: 'Look for how the text describes the blank word.',
          skillTags: ['Vocabulary', 'Reading Comprehension'],
        },
        {
          id: 'mcl-68-q5',
          question: 'What two clues did Miranda combine?',
          options: [
            { id: 'a', label: 'A bell and a backpack' },
            { id: 'b', label: 'A shoe and a clock' },
            { id: 'c', label: 'The sentence and the drawing' },
            { id: 'd', label: 'Lunch and recess schedules' },
          ],
          correctAnswer: 'c',
          explanation:
            'Miranda used context clues from both the sentence and the sketch to infer the meeting place.',
          hint: 'She did not rely on just one piece of evidence.',
          skillTags: ['Context Clues', 'Analysis'],
        },
      ],
    },
  },
};

registerMirandaAdaptiveFile(MIRANDA_MISSING_CLUE_FILE);
