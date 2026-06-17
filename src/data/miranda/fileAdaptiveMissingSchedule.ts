import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_MISSING_SCHEDULE_ID = 'miranda-mystery-file-1';

const SHARED_LANDING = {
  eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
  title: "Miranda's Mystery Files",
  subtitle: 'The Missing Schedule',
  body: 'Miranda notices the morning schedule is missing before Focus Flame begins. Read the clues and solve the mystery.',
  cta: 'Open Case',
};

const SHARED_COMPLETE = {
  title: 'Schedule Mystery Solved',
  message:
    'Miranda found the missing schedule and helped the class feel ready. Great reading detective work!',
  badges: ['Reading Detective', 'Detail Spotter', 'Focus Flame Helper'],
};

export const MIRANDA_MISSING_SCHEDULE_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_MISSING_SCHEDULE_ID,
  title: 'The Missing Schedule',
  character: 'miranda',
  fileNumber: 1,
  skillFocus: ['Reading Comprehension', 'Sequencing', 'Inference'],
  presentationStyle: 'case_file',
  landing: SHARED_LANDING,
  complete: SHARED_COMPLETE,
  gradeContent: {
    '2-3': {
      dashboardTitle: 'The Missing Schedule',
      dashboardDescription: 'Read a short clue and answer what happened.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'Before the Focus Flame activity began, students kept asking, "What are we doing next?" Miranda looked at the front board. The morning schedule card was missing. She remembered seeing the teacher carry a stack of folders near the reading table. Miranda checked near the folders and found the schedule card tucked underneath.',
      skillTags: ['Reading Comprehension', 'Sequencing', 'Inference'],
      questions: [
        {
          id: 'ms-23-q1',
          question: 'What was missing from the board?',
          options: [
            { id: 'a', label: 'A backpack' },
            { id: 'b', label: 'The schedule card' },
            { id: 'c', label: 'A lunch box' },
            { id: 'd', label: 'A pencil' },
          ],
          correctAnswer: 'b',
          explanation: 'The passage says the morning schedule card was missing from the board.',
          hint: 'Look for what Miranda noticed was gone.',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'ms-23-q2',
          question: 'Where did Miranda find the missing card?',
          options: [
            { id: 'a', label: 'Under the folders' },
            { id: 'b', label: 'In the cafeteria' },
            { id: 'c', label: 'Inside a backpack' },
            { id: 'd', label: 'On the playground' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda found the schedule card tucked underneath the folders.',
          hint: 'Look for the place near the reading table.',
          skillTags: ['Sequencing', 'Recall'],
        },
        {
          id: 'ms-23-q3',
          question: 'Why were the students confused?',
          options: [
            { id: 'a', label: 'They were tired' },
            { id: 'b', label: 'They did not know what was next' },
            { id: 'c', label: 'They lost their pencils' },
            { id: 'd', label: 'They wanted lunch' },
          ],
          correctAnswer: 'b',
          explanation:
            'The students kept asking what they were doing next because the schedule card was missing.',
          hint: 'Think about what a schedule helps students know.',
          skillTags: ['Inference'],
        },
        {
          id: 'ms-23-q4',
          question: 'What happened before Miranda found the schedule card?',
          options: [
            { id: 'a', label: 'Miranda hung a new card on the board' },
            { id: 'b', label: 'Focus Flame ended for the day' },
            { id: 'c', label: 'The teacher carried folders from the board area' },
            { id: 'd', label: 'Students packed up for lunch' },
          ],
          correctAnswer: 'c',
          explanation:
            'The passage says Miranda remembered the teacher carrying folders before she found the card underneath.',
          hint: 'Think about the order of events in the story.',
          skillTags: ['Sequencing'],
        },
        {
          id: 'ms-23-q5',
          question: 'What did Miranda do to solve the problem?',
          options: [
            { id: 'a', label: 'She asked every student to search outside' },
            { id: 'b', label: 'She erased the board and started over' },
            { id: 'c', label: 'She waited until lunch to look again' },
            { id: 'd', label: 'She checked near the folders at the reading table' },
          ],
          correctAnswer: 'd',
          explanation:
            'Miranda checked near the folders by the reading table and found the schedule card tucked underneath.',
          hint: 'Where did Miranda search after remembering the folders?',
          skillTags: ['Reading Comprehension', 'Inference'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: 'The Missing Schedule',
      dashboardDescription: 'Use details from the clue to solve what happened.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'Before the Focus Flame activity began, Miranda noticed the classroom felt unsettled. Several students asked, "What are we doing next?" The morning schedule card was no longer posted on the board. Miranda remembered seeing the teacher carry a stack of folders from the board area to the reading table. Instead of interrupting the class, Miranda scanned the room and found one corner of the schedule card tucked beneath the folders.',
      skillTags: ['Reading Comprehension', 'Evidence', 'Inference'],
      questions: [
        {
          id: 'ms-45-q1',
          question: 'What detail first helped Miranda understand the problem?',
          options: [
            { id: 'a', label: 'Students were asking what came next' },
            { id: 'b', label: 'The teacher was absent' },
            { id: 'c', label: 'The lights were off' },
            { id: 'd', label: 'Students were running outside' },
          ],
          correctAnswer: 'a',
          explanation:
            'The repeated question helped Miranda notice that students did not know the next activity.',
          hint: 'Which clue showed that students were unsure?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'ms-45-q2',
          question: 'Which evidence helped Miranda find the schedule card?',
          options: [
            { id: 'a', label: 'A noise in the hallway' },
            { id: 'b', label: 'The teacher carrying folders from the board area' },
            { id: 'c', label: 'A student pointing at the playground' },
            { id: 'd', label: 'A note on the door' },
          ],
          correctAnswer: 'b',
          explanation:
            'Miranda connected the teacher’s movement with where the card might have gone.',
          hint: 'Look for what Miranda remembered seeing earlier.',
          skillTags: ['Evidence', 'Inference'],
        },
        {
          id: 'ms-45-q3',
          question: 'What character trait did Miranda use?',
          options: [
            { id: 'a', label: 'Careful observation' },
            { id: 'b', label: 'Anger' },
            { id: 'c', label: 'Guessing' },
            { id: 'd', label: 'Avoiding the problem' },
          ],
          correctAnswer: 'a',
          explanation:
            'Miranda carefully observed the classroom and used clues to solve the problem.',
          hint: 'Think about what detectives do.',
          skillTags: ['Inference', 'Character'],
        },
        {
          id: 'ms-45-q4',
          question: 'What activity were students about to begin?',
          options: [
            { id: 'a', label: 'Lunch' },
            { id: 'b', label: 'Recess' },
            { id: 'c', label: 'Focus Flame' },
            { id: 'd', label: 'A field trip' },
          ],
          correctAnswer: 'c',
          explanation:
            'The passage says the Focus Flame activity was about to begin when Miranda noticed the problem.',
          hint: 'Look at the first sentence for the activity name.',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'ms-45-q5',
          question: 'Why did Miranda scan the room quietly?',
          options: [
            { id: 'a', label: 'She was afraid of getting in trouble' },
            { id: 'b', label: 'She wanted to surprise the teacher' },
            { id: 'c', label: 'She did not think the schedule mattered' },
            { id: 'd', label: 'She did not want to interrupt the class' },
          ],
          correctAnswer: 'd',
          explanation:
            'Miranda scanned the room instead of interrupting the class while the activity was starting.',
          hint: 'Think about what was happening when she looked for the card.',
          skillTags: ['Inference', 'Character'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: 'The Missing Schedule',
      dashboardDescription: 'Analyze evidence and make an inference from the clue.',
      scenarioEyebrow: 'CASE FILE',
      passage:
        'At the start of the Focus Flame activity, Miranda observed that several students seemed uncertain about the classroom routine. The daily schedule card, which usually helped students prepare for transitions, was no longer displayed. Miranda reconstructed the sequence of events: the teacher had gathered materials near the board, carried folders to the reading table, and then started the activity. Based on the position of the folders and the partially visible corner of the card, Miranda inferred that the schedule card had been moved accidentally.',
      skillTags: ['Analysis', 'Inference', 'Evidence'],
      questions: [
        {
          id: 'ms-68-q1',
          question: 'Which evidence best supports Miranda’s conclusion?',
          options: [
            { id: 'a', label: 'Students were sitting quietly' },
            { id: 'b', label: 'The schedule card was partly visible beneath the folders' },
            { id: 'c', label: 'The cafeteria was closed' },
            { id: 'd', label: 'The clock was broken' },
          ],
          correctAnswer: 'b',
          explanation:
            'The visible corner of the card beneath the folders directly supports Miranda’s conclusion.',
          hint: 'Look for the strongest physical evidence.',
          skillTags: ['Evidence', 'Analysis'],
        },
        {
          id: 'ms-68-q2',
          question: 'Why does the missing schedule matter?',
          options: [
            { id: 'a', label: 'It makes transitions less predictable' },
            { id: 'b', label: 'It makes the room colder' },
            { id: 'c', label: 'It changes lunch time' },
            { id: 'd', label: 'It helps students ignore directions' },
          ],
          correctAnswer: 'a',
          explanation:
            'The schedule helps students understand what comes next, so losing it can make transitions harder.',
          hint: 'Think about what routines help students do.',
          skillTags: ['Inference'],
        },
        {
          id: 'ms-68-q3',
          question: 'What does “inferred” mean in this passage?',
          options: [
            { id: 'a', label: 'Guessed without evidence' },
            { id: 'b', label: 'Used clues to reach a conclusion' },
            { id: 'c', label: 'Asked someone to leave' },
            { id: 'd', label: 'Forgot important details' },
          ],
          correctAnswer: 'b',
          explanation: 'Miranda used clues from the room to figure out what likely happened.',
          hint: 'Detectives infer when they combine clues.',
          skillTags: ['Vocabulary', 'Inference'],
        },
        {
          id: 'ms-68-q4',
          question: 'What sequence did Miranda reconstruct?',
          options: [
            { id: 'a', label: 'Students left, then returned with the card' },
            { id: 'b', label: 'The teacher gathered materials, carried folders, then started the activity' },
            { id: 'c', label: 'Miranda erased the board, then posted a new schedule' },
            { id: 'd', label: 'Lunch ended, then recess began' },
          ],
          correctAnswer: 'b',
          explanation:
            'Miranda reconstructed that the teacher gathered materials, carried folders to the reading table, and then started the activity.',
          hint: 'Look for the order of events Miranda pieced together.',
          skillTags: ['Sequencing', 'Analysis'],
        },
        {
          id: 'ms-68-q5',
          question: 'What can readers infer about how the card was moved?',
          options: [
            { id: 'a', label: 'Someone hid it on purpose' },
            { id: 'b', label: 'It was moved accidentally when folders were carried' },
            { id: 'c', label: 'It was never posted that day' },
            { id: 'd', label: 'A student took it home' },
          ],
          correctAnswer: 'b',
          explanation:
            'Miranda inferred the schedule card had been moved accidentally when the teacher carried the folders.',
          hint: 'What does Miranda conclude from the evidence?',
          skillTags: ['Inference', 'Evidence'],
        },
      ],
    },
    // TODO: Add dedicated K-1 passage and questions (currently falls back to 2-3).
  },
};

registerMirandaAdaptiveFile(MIRANDA_MISSING_SCHEDULE_FILE);
