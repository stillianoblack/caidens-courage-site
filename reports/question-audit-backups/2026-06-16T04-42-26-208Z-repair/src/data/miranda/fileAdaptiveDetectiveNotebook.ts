import type { MirandaAdaptiveFile } from '../../types/mirandaAdaptiveQuest';
import { registerMirandaAdaptiveFile } from './mirandaAdaptiveBuilder';

export const MIRANDA_DETECTIVE_NOTEBOOK_ID = 'mirandas-detective-notebook';

export const MIRANDA_DETECTIVE_NOTEBOOK_FILE: MirandaAdaptiveFile = {
  id: MIRANDA_DETECTIVE_NOTEBOOK_ID,
  title: "Miranda's Detective Notebook",
  character: 'miranda',
  fileNumber: 6,
  skillFocus: ['Comprehension', 'Inference', 'Critical Thinking'],
  presentationStyle: 'case_file',
  landing: {
    eyebrow: 'MYSTERY FILE · ADAPTIVE READING',
    title: "Miranda's Mystery Files",
    subtitle: "Miranda's Detective Notebook",
    body: 'Follow the footprint trail, study the evidence, and make smart inferences.',
    cta: 'Follow the Trail',
  },
  complete: {
    title: 'Trail Complete',
    message: 'Miranda followed the footprints, found the hidden clue, and solved the lesson mystery!',
    badges: ['Trail Tracker', 'Inference Investigator', 'Detail Detective'],
  },
  gradeContent: {
    'K-1': {
      dashboardTitle: "Miranda's Detective Notebook",
      dashboardDescription: 'Follow simple clues and answer what happened.',
      scenarioEyebrow: 'TRAIL NOTEBOOK',
      passage:
        'Miranda found muddy footprints near the gym. The footprints led to the library. Under a table, she found a clue taped to the wood.',
      skillTags: ['Comprehension', 'Observation'],
      questions: [
        {
          id: 'mdn-k1-q1',
          question: 'According to the passage, where did Miranda find footprints?',
          options: [
            { id: 'a', label: 'Near the gym' },
            { id: 'b', label: 'On the bus' },
            { id: 'c', label: 'In the cafeteria' },
            { id: 'd', label: 'On the playground slide' },
          ],
          correctAnswer: 'a',
          explanation: 'The passage says Miranda found muddy footprints near the gym.',
          hint: 'Where did the trail begin?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mdn-k1-q2',
          question: 'Which clue best supports where Miranda went next?',
          options: [
            { id: 'a', label: 'The footprints led to the library' },
            { id: 'b', label: 'Miranda ate lunch' },
            { id: 'c', label: 'The gym door was locked' },
            { id: 'd', label: 'A bell rang' },
          ],
          correctAnswer: 'a',
          explanation: 'The footprints pointing to the library show where Miranda followed the trail.',
          hint: 'What did the footprints do?',
          skillTags: ['Inference', 'Evidence'],
        },
        {
          id: 'mdn-k1-q3',
          question: 'Where did Miranda find the hidden clue?',
          options: [
            { id: 'a', label: 'Under a table' },
            { id: 'b', label: 'In her backpack' },
            { id: 'c', label: 'On the roof' },
            { id: 'd', label: 'Inside a shoe' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda found a clue taped under a table in the library.',
          hint: 'Look for where the clue was hidden.',
          skillTags: ['Reading Comprehension'],
        },
      ],
    },
    '2-3': {
      dashboardTitle: "Miranda's Detective Notebook",
      dashboardDescription: 'Follow the trail and use evidence from the passage.',
      scenarioEyebrow: 'TRAIL NOTEBOOK',
      passage:
        'Miranda spotted muddy footprints near the gym door. She followed the trail down the hallway until the prints stopped outside the library. Inside, she knelt beneath a reading table and found a folded note taped to the underside. The note said the missing schedule was hidden for a team-building surprise.',
      skillTags: ['Comprehension', 'Inference', 'Sequencing'],
      questions: [
        {
          id: 'mdn-23-q1',
          question: 'According to the passage, where did the footprints stop?',
          options: [
            { id: 'a', label: 'Outside the library' },
            { id: 'b', label: 'Inside the gym closet' },
            { id: 'c', label: 'On the playground' },
            { id: 'd', label: 'At the bus stop' },
          ],
          correctAnswer: 'a',
          explanation: 'The prints stopped outside the library before Miranda went inside.',
          hint: 'Where did the trail end?',
          skillTags: ['Reading Comprehension'],
        },
        {
          id: 'mdn-23-q2',
          question: 'Which clue best supports why Miranda knelt under the table?',
          options: [
            { id: 'a', label: 'She was searching for a hidden note' },
            { id: 'b', label: 'She dropped her pencil' },
            { id: 'c', label: 'She wanted to take a nap' },
            { id: 'd', label: 'She was hiding from a friend' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda searched beneath the table and found a folded note taped there.',
          hint: 'What did she find under the table?',
          skillTags: ['Inference', 'Evidence'],
        },
        {
          id: 'mdn-23-q3',
          question: 'What did the hidden note explain?',
          options: [
            { id: 'a', label: 'The schedule was hidden for a surprise' },
            { id: 'b', label: 'The library was closed forever' },
            { id: 'c', label: 'Miranda was in trouble' },
            { id: 'd', label: 'The gym was being torn down' },
          ],
          correctAnswer: 'a',
          explanation: 'The note said the missing schedule was hidden for a team-building surprise.',
          hint: 'Why was the schedule missing?',
          skillTags: ['Inference', 'Comprehension'],
        },
      ],
    },
    '4-5': {
      dashboardTitle: "Miranda's Detective Notebook",
      dashboardDescription: 'Study trail evidence and draw conclusions from the passage.',
      scenarioEyebrow: 'TRAIL NOTEBOOK',
      passage:
        'Miranda documented a trail of muddy footprints that began near the gym and continued in a straight path toward the library. The depth of the prints suggested someone had walked quickly while carrying something. Beneath a library table, she recovered a note explaining that the schedule had been moved temporarily for a planned surprise activity.',
      skillTags: ['Evidence', 'Inference', 'Analysis'],
      questions: [
        {
          id: 'mdn-45-q1',
          question: 'According to the passage, what did the depth of the prints suggest?',
          options: [
            { id: 'a', label: 'Someone walked quickly while carrying something' },
            { id: 'b', label: 'Nobody had been in the hallway' },
            { id: 'c', label: 'The gym floor was dry' },
            { id: 'd', label: 'The library was empty all day' },
          ],
          correctAnswer: 'a',
          explanation: 'Deeper prints can mean quicker steps and extra weight from carrying an item.',
          hint: 'What does Miranda conclude from the print depth?',
          skillTags: ['Inference', 'Evidence'],
        },
        {
          id: 'mdn-45-q2',
          question: 'Which clue best supports that the schedule was not stolen?',
          options: [
            { id: 'a', label: 'A note said it was moved for a planned surprise' },
            { id: 'b', label: 'The footprints disappeared completely' },
            { id: 'c', label: 'Miranda found no note at all' },
            { id: 'd', label: 'The gym door was broken' },
          ],
          correctAnswer: 'a',
          explanation: 'The note explains a temporary move for a surprise, not theft.',
          hint: 'What reason did the note give?',
          skillTags: ['Inference', 'Critical Thinking'],
        },
        {
          id: 'mdn-45-q3',
          question: 'What does "recovered" mean in the passage?',
          options: [
            { id: 'a', label: 'Found and took back' },
            { id: 'b', label: 'Threw away' },
            { id: 'c', label: 'Forgot about' },
            { id: 'd', label: 'Copied from a friend' },
          ],
          correctAnswer: 'a',
          explanation: 'Miranda recovered the note, meaning she found it and retrieved it.',
          hint: 'What did Miranda do with the note under the table?',
          skillTags: ['Vocabulary', 'Context Clues'],
        },
      ],
    },
    '6-8': {
      dashboardTitle: "Miranda's Detective Notebook",
      dashboardDescription: 'Analyze trail evidence and evaluate inferences from the case.',
      scenarioEyebrow: 'TRAIL NOTEBOOK',
      passage:
        'Miranda analyzed a sequence of muddy footprints leading from the gym to the library. The trail\'s straight path and deep impressions suggested purposeful movement rather than random wandering. After recovering a note beneath a reading table, she inferred that the missing schedule had been relocated intentionally for a team-building surprise, not removed because of a problem.',
      skillTags: ['Analysis', 'Inference', 'Critical Thinking'],
      questions: [
        {
          id: 'mdn-68-q1',
          question: 'According to the passage, what did the trail\'s straight path suggest?',
          options: [
            { id: 'a', label: 'Purposeful movement toward one destination' },
            { id: 'b', label: 'Random wandering with no goal' },
            { id: 'c', label: 'That no one had walked there' },
            { id: 'd', label: 'That the gym had flooded' },
          ],
          correctAnswer: 'a',
          explanation: 'A straight path toward the library suggests someone moved with a clear purpose.',
          hint: 'How is purposeful movement different from wandering?',
          skillTags: ['Analysis', 'Inference'],
        },
        {
          id: 'mdn-68-q2',
          question: 'Which clue best supports Miranda\'s inference about the schedule?',
          options: [
            { id: 'a', label: 'The note said it was relocated for a team-building surprise' },
            { id: 'b', label: 'The footprints were shallow and scattered' },
            { id: 'c', label: 'Miranda found no evidence in the library' },
            { id: 'd', label: 'The gym door was left wide open' },
          ],
          correctAnswer: 'a',
          explanation: 'The note directly explains an intentional relocation, supporting Miranda\'s conclusion.',
          hint: 'Which evidence explains why the schedule was moved?',
          skillTags: ['Evidence', 'Inference'],
        },
        {
          id: 'mdn-68-q3',
          question: 'Why is it important that Miranda inferred before reacting?',
          options: [
            { id: 'a', label: 'Evidence helped her avoid jumping to the wrong conclusion' },
            { id: 'b', label: 'She wanted to ignore the note' },
            { id: 'c', label: 'She hoped the schedule was stolen' },
            { id: 'd', label: 'She did not need any clues' },
          ],
          correctAnswer: 'a',
          explanation: 'Using trail evidence and the note helped Miranda understand the situation accurately.',
          hint: 'What does good detective work prevent?',
          skillTags: ['Critical Thinking', 'Analysis'],
        },
      ],
    },
  },
};

registerMirandaAdaptiveFile(MIRANDA_DETECTIVE_NOTEBOOK_FILE);
