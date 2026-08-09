import {
  DRAGONS_NEST_CAMPAIGN,
  getQuestionVariant,
  getStoryQuestionsForChapter,
} from '.';

describe('approved Story Quest campaign', () => {
  const playableQuestions = (chapterId: string) => getStoryQuestionsForChapter(chapterId)
    .filter((question) => question.contentStatus === 'playable');

  test('keeps only Chapters 1 and 2 playable with five questions each', () => {
    expect(playableQuestions('chapter-1')).toHaveLength(5);
    expect(playableQuestions('chapter-2')).toHaveLength(5);

    for (const chapter of DRAGONS_NEST_CAMPAIGN.chapters.slice(2)) {
      expect(playableQuestions(chapter.id)).toHaveLength(0);
    }
  });

  test('uses the approved Courage in the Dark sequence and answers', () => {
    const chapterTwo = playableQuestions('chapter-2');
    const expected = [
      ['Why did Caiden step outside during the storm?', 'He heard something strange'],
      ['How did Caiden feel when he heard the strange noise?', 'Nervous and unsure'],
      ['What did Caiden do even though he felt nervous?', 'Continued exploring carefully'],
      ['When Caiden heard an unfamiliar voice, what was the best thing for him to do first?', 'Stay alert and think carefully'],
      ['After Caiden discovers Charlie Perk, what emotions might he be feeling?', 'More than one of these at the same time'],
    ];

    expect(chapterTwo.map((question) => {
      const variant = getQuestionVariant(question, '5-6');
      return [variant.prompt, variant.correctAnswer];
    })).toEqual(expected);
  });

  test('does not include an earthquake in playable Story Quest content', () => {
    const playableContent = DRAGONS_NEST_CAMPAIGN.questions
      .filter((question) => question.contentStatus === 'playable')
      .flatMap((question) => Object.values(question.variants))
      .flatMap((variant) => [
        variant.prompt,
        variant.correctAnswer,
        variant.hint,
        variant.b4Feedback,
        ...variant.answers,
      ])
      .join(' ');

    expect(playableContent.toLowerCase()).not.toContain('earthquake');
  });
});
