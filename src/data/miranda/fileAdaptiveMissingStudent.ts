import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_MISSING_STUDENT_ID = 'miranda-mystery-file-2';

export const MIRANDA_MISSING_STUDENT_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_MISSING_STUDENT_ID,
  title: 'The Missing Student',
  character: 'miranda',
  fileNumber: 2,
  skillFocus: ['Reading Comprehension', 'Safety', 'Observation'],
  presentationStyle: 'case_file',
  landing: {
    eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Student',
    body: 'Caiden is missing after the ceremony. Follow Miranda’s clues and make safe choices.',
    cta: 'Open Case',
  },
  complete: {
    title: 'Student Found Safely',
    message: 'Miranda used careful observation and told an adult. Great detective work!',
    badges: ['Safety Star', 'Observation Pro', 'Team Helper'],
  },
  gradeContent: {
    '2-3': {
      dashboardTitle: 'The Missing Student',
      dashboardDescription: 'Read a short clue and answer what happened.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'Caiden was not in the line after the ceremony. Miranda looked around carefully. She saw Caiden’s notebook on a chair and heard a sound near the hallway. Miranda told an adult and walked with the group to check safely.',
      skillTags: ['Reading Comprehension', 'Safety'],
      questions: [
        {
          id: 'mst-23-q1',
          question: 'Who was missing from the line?',
          options: [
            { id: 'a', label: 'Miranda' },
            { id: 'b', label: 'Caiden' },
            { id: 'c', label: 'B-4' },
            { id: 'd', label: 'Charlie' },
          ],
          correctAnswer: 'b',
          explanation: 'The passage says Caiden was not in the line after the ceremony.',
          hint: 'Look for who was missing.',
          skillTags: ['Recall'],
        },
        {
          id: 'mst-23-q2',
          question: 'What did Miranda see on the chair?',
          options: [
            { id: 'a', label: 'Caiden’s notebook' },
            { id: 'b', label: 'A snack' },
            { id: 'c', label: 'A toy' },
            { id: 'd', label: 'A jacket' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda saw Caiden’s notebook on a chair.',
          hint: 'What belonged to Caiden?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mst-23-q3',
          question: 'What safe choice did Miranda make?',
          options: [
            { id: 'a', label: 'She ran alone' },
            { id: 'b', label: 'She told an adult' },
            { id: 'c', label: 'She yelled at everyone' },
            { id: 'd', label: 'She ignored it' },
          ],
          correctAnswer: 'b',
          explanation: 'Miranda told an adult instead of searching alone.',
          hint: 'Think about the safest choice.',
          skillTags: ['Safety', 'Inference'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: 'The Missing Student',
      dashboardDescription: 'Use details from the clue to solve what happened.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'After the ceremony, Miranda noticed Caiden was no longer standing with the group. His notebook was still on a chair, and his water bottle had rolled under the table. Miranda heard a faint sound near the hallway. Instead of searching alone, she told the facilitator what she noticed and helped the group retrace the last place Caiden had been seen.',
      skillTags: ['Evidence', 'Safety', 'Vocabulary'],
      questions: [
        {
          id: 'mst-45-q1',
          question: 'What clue suggested Caiden left quickly?',
          options: [
            { id: 'a', label: 'His notebook and water bottle were left behind' },
            { id: 'b', label: 'He packed his bag neatly' },
            { id: 'c', label: 'The lights turned off' },
            { id: 'd', label: 'Miranda found a map' },
          ],
          correctAnswer: 'a',
          explanation: 'Caiden left his belongings behind, which suggests he left in a hurry.',
          hint: 'What was still at his seat?',
          skillTags: ['Inference', 'Evidence'],
        },
        {
          id: 'mst-45-q2',
          question: 'Why did Miranda tell the facilitator?',
          options: [
            { id: 'a', label: 'It was the safest choice' },
            { id: 'b', label: 'She wanted to stop playing' },
            { id: 'c', label: 'She was bored' },
            { id: 'd', label: 'She wanted to hide the clue' },
          ],
          correctAnswer: 'a',
          explanation: 'Telling an adult was the safest way to get help.',
          hint: 'Think about responsibility and safety.',
          skillTags: ['Safety'],
        },
        {
          id: 'mst-45-q3',
          question: 'What does “retrace” mean?',
          options: [
            { id: 'a', label: 'Draw a picture' },
            { id: 'b', label: 'Follow back through the steps' },
            { id: 'c', label: 'Skip the activity' },
            { id: 'd', label: 'Make a guess' },
          ],
          correctAnswer: 'b',
          explanation: 'To retrace means to go back through the steps someone took.',
          hint: 'Miranda helped follow Caiden’s path.',
          skillTags: ['Vocabulary'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: 'The Missing Student',
      dashboardDescription: 'Analyze evidence and make an inference from the clue.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'When the ceremony ended, Miranda immediately noticed a change in the group’s pattern: Caiden was absent, but his notebook remained on the chair beside his water bottle. Rather than assume he had simply left, Miranda identified the last confirmed location where Caiden had been seen and reported the information to the facilitator. Her goal was not to solve the situation alone but to provide useful observations so the adults could respond quickly and safely.',
      skillTags: ['Analysis', 'Safety', 'Responsibility'],
      questions: [
        {
          id: 'mst-68-q1',
          question: 'Which detail is most important evidence?',
          options: [
            { id: 'a', label: 'Caiden’s belongings were left behind' },
            { id: 'b', label: 'The room was quiet' },
            { id: 'c', label: 'The ceremony ended' },
            { id: 'd', label: 'Miranda liked mysteries' },
          ],
          correctAnswer: 'a',
          explanation: 'The belongings suggest Caiden left unexpectedly from his seat.',
          hint: 'What physical evidence was left behind?',
          skillTags: ['Evidence', 'Analysis'],
        },
        {
          id: 'mst-68-q2',
          question: 'What does Miranda’s response show?',
          options: [
            { id: 'a', label: 'She understands safety and responsibility' },
            { id: 'b', label: 'She wants attention' },
            { id: 'c', label: 'She ignores adults' },
            { id: 'd', label: 'She dislikes group work' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda reported observations to adults instead of acting alone.',
          hint: 'Think about how she handled the situation.',
          skillTags: ['Inference', 'Character'],
        },
        {
          id: 'mst-68-q3',
          question: 'Why is “last confirmed location” important?',
          options: [
            { id: 'a', label: 'It helps adults know where to begin checking' },
            { id: 'b', label: 'It proves Caiden was hiding' },
            { id: 'c', label: 'It makes the mystery harder' },
            { id: 'd', label: 'It replaces asking for help' },
          ],
          correctAnswer: 'a',
          explanation: 'Knowing where Caiden was last seen helps adults search effectively.',
          hint: 'How does this help the facilitator?',
          skillTags: ['Analysis'],
        },
      ],
    },
  },
};

registerMirandaAdaptiveFile(MIRANDA_MISSING_STUDENT_FILE);
