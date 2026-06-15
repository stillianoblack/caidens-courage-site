import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_MISSING_LETTERS_ID = 'the-missing-letters';

export const MIRANDA_MISSING_LETTERS_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_MISSING_LETTERS_ID,
  title: 'The Missing Letters',
  character: 'miranda',
  fileNumber: 4,
  skillFocus: ['Spelling', 'Word Building', 'Context Clues'],
  presentationStyle: 'case_file',
  landing: {
    eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Letters',
    body: 'Letters vanished from the clues. Use context to restore the words and crack the case.',
    cta: 'Open Case',
  },
  complete: {
    title: 'Words Restored',
    message: 'Miranda restored every missing letter and uncovered the hidden clues. Case closed!',
    badges: ['Word Detective', 'Spelling Solver', 'Focus Flame Investigator'],
  },
  gradeContent: {
    'K-1': {
      dashboardTitle: 'The Missing Letters',
      dashboardDescription: 'Find the missing letters in a short clue.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda found a note behind a poster. Some letters were missing. The note said, "Meet at the l_br_y after lunch." A picture of books helped Miranda know the word was library.',
      skillTags: ['Spelling', 'Context Clues'],
      questions: [
        {
          id: 'mml-k1-q1',
          question: 'According to the passage, what was wrong with the note?',
          options: [
            { id: 'a', label: 'Some letters were missing' },
            { id: 'b', label: 'The whole note was gone' },
            { id: 'c', label: 'The poster fell down' },
            { id: 'd', label: 'Miranda lost her pencil' },
          ],
          correctAnswer: 'a',
          explanation: 'The passage says some letters were missing from the note.',
          hint: 'What could Miranda not read clearly?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mml-k1-q2',
          question: 'Which clue best supports the missing word?',
          options: [
            { id: 'a', label: 'A picture of books' },
            { id: 'b', label: 'A picture of a ball' },
            { id: 'c', label: 'A picture of a shoe' },
            { id: 'd', label: 'A picture of a clock' },
          ],
          correctAnswer: 'a',
          explanation: 'The picture of books points to the word library.',
          hint: 'What did the picture show?',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mml-k1-q3',
          question: 'What word completes the note?',
          options: [
            { id: 'a', label: 'library' },
            { id: 'b', label: 'lunch' },
            { id: 'c', label: 'locker' },
            { id: 'd', label: 'lamp' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda used the book picture to know the word was library.',
          hint: 'Where do you find books?',
          skillTags: ['Word Building'],
        },
      ],
    },
    '2-3': {
      dashboardTitle: 'The Missing Letters',
      dashboardDescription: 'Restore missing letters using clues from the passage.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda found a hidden m_ssage taped behind a poster. The smudged letters made the word hard to read. Beside the note was a drawing of an envelope with writing inside. Miranda compared the picture to the blank spaces and restored the word message.',
      skillTags: ['Spelling', 'Context Clues', 'Vocabulary'],
      questions: [
        {
          id: 'mml-23-q1',
          question: 'According to the passage, what did Miranda find behind the poster?',
          options: [
            { id: 'a', label: 'A hidden message with missing letters' },
            { id: 'b', label: 'A new backpack' },
            { id: 'c', label: 'A lunch tray' },
            { id: 'd', label: 'A broken pencil' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda found a hidden message with smudged, missing letters.',
          hint: 'What was taped behind the poster?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mml-23-q2',
          question: 'Which clue best supports the restored word?',
          options: [
            { id: 'a', label: 'The drawing of an envelope with writing inside' },
            { id: 'b', label: 'The poster color' },
            { id: 'c', label: 'The time of day' },
            { id: 'd', label: 'The hallway noise' },
          ],
          correctAnswer: 'a',
          explanation: 'The envelope drawing suggests someone wrote a message.',
          hint: 'What picture was beside the note?',
          skillTags: ['Context Clues'],
        },
        {
          id: 'mml-23-q3',
          question: 'What word completes m_ssage?',
          options: [
            { id: 'a', label: 'message' },
            { id: 'b', label: 'mesage' },
            { id: 'c', label: 'messige' },
            { id: 'd', label: 'messege' },
          ],
          correctAnswer: 'a',
          explanation: 'Message is the correct spelling that fits the clue and context.',
          hint: 'Count the missing letters and match the picture.',
          skillTags: ['Spelling', 'Word Building'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: 'The Missing Letters',
      dashboardDescription: 'Use context clues to restore detective words with missing letters.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda examined a case file where several detective words had vanished. One entry read, "The witness gave a helpful d_scr_pt_on of the suspect." Nearby, Miranda\'s notes described someone\'s appearance in detail. She used the surrounding sentence and her notes to infer the missing word was description.',
      skillTags: ['Vocabulary', 'Context Clues', 'Inference'],
      questions: [
        {
          id: 'mml-45-q1',
          question: 'According to the passage, what was missing from the case file?',
          options: [
            { id: 'a', label: 'Letters inside detective words' },
            { id: 'b', label: 'The whole case file' },
            { id: 'c', label: 'Miranda\'s badge' },
            { id: 'd', label: 'The suspect\'s name only' },
          ],
          correctAnswer: 'a',
          explanation: 'Several detective words had letters missing from inside them.',
          hint: 'What kind of words were damaged?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mml-45-q2',
          question: 'Which clue best supports the word description?',
          options: [
            { id: 'a', label: 'Notes about someone\'s appearance in detail' },
            { id: 'b', label: 'A drawing of a lunch table' },
            { id: 'c', label: 'A bell ringing' },
            { id: 'd', label: 'A closed classroom door' },
          ],
          correctAnswer: 'a',
          explanation: 'A description tells what someone looks like, matching Miranda\'s detail notes.',
          hint: 'What kind of information is a description?',
          skillTags: ['Context Clues', 'Inference'],
        },
        {
          id: 'mml-45-q3',
          question: 'What does "witness" mean in the passage?',
          options: [
            { id: 'a', label: 'Someone who saw what happened' },
            { id: 'b', label: 'Someone who hides clues' },
            { id: 'c', label: 'A type of backpack' },
            { id: 'd', label: 'A school schedule' },
          ],
          correctAnswer: 'a',
          explanation: 'A witness is a person who saw an event and can describe it.',
          hint: 'Who would give information about a suspect?',
          skillTags: ['Vocabulary'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: 'The Missing Letters',
      dashboardDescription: 'Analyze context clues to restore corrupted detective vocabulary.',
      scenarioEyebrow: 'CLUE FILE',
      passage:
        'Miranda recovered a partially damaged investigation log. Key terms had missing letters: "The team will inv_st_g_te the disc_p_ncy between the two witness accounts." Although the letters were gone, Miranda noted that investigate means to examine closely and discrepancy means a difference that does not match. She used both context clues and word structure to restore the corrupted terms.',
      skillTags: ['Vocabulary', 'Analysis', 'Word Building'],
      questions: [
        {
          id: 'mml-68-q1',
          question: 'According to the passage, how did Miranda restore the words?',
          options: [
            { id: 'a', label: 'She used context clues and word structure' },
            { id: 'b', label: 'She guessed without reading' },
            { id: 'c', label: 'She erased the whole log' },
            { id: 'd', label: 'She asked someone else to solve it' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda combined sentence context and word parts to restore the terms.',
          hint: 'What strategies does the passage describe?',
          skillTags: ['Analysis'],
        },
        {
          id: 'mml-68-q2',
          question: 'Which clue best supports the word discrepancy?',
          options: [
            { id: 'a', label: 'A difference between two witness accounts' },
            { id: 'b', label: 'A matching story from everyone' },
            { id: 'c', label: 'A single empty chair' },
            { id: 'd', label: 'A poster on the wall' },
          ],
          correctAnswer: 'a',
          explanation: 'A discrepancy is a mismatch, which fits two different witness accounts.',
          hint: 'What situation suggests things do not match?',
          skillTags: ['Context Clues', 'Vocabulary'],
        },
        {
          id: 'mml-68-q3',
          question: 'What does "investigate" mean in this log?',
          options: [
            { id: 'a', label: 'Examine closely to find answers' },
            { id: 'b', label: 'Ignore the problem' },
            { id: 'c', label: 'Finish lunch early' },
            { id: 'd', label: 'Hide the evidence' },
          ],
          correctAnswer: 'a',
          explanation: 'To investigate means to examine a situation carefully to learn the truth.',
          hint: 'What do detectives do with a case?',
          skillTags: ['Vocabulary', 'Inference'],
        },
      ],
    },
  },
};

registerMirandaAdaptiveFile(MIRANDA_MISSING_LETTERS_FILE);
