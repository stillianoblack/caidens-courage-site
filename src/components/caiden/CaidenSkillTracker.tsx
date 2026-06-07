import React from 'react';
import FocusSkillsSnapshot from '../focus-skills/FocusSkillsSnapshot';

const QUEST_SKILLS = [
  {
    questNumber: 1,
    title: 'Quest 1',
    category: 'Executive Function',
    skills: ['Planning', 'Prioritization', 'Organization'],
  },
  {
    questNumber: 2,
    title: 'Quest 2',
    category: 'Self-Regulation',
    skills: ['Emotions', 'Decision Making', 'Persistence', 'Growth Mindset'],
  },
] as const;

export default function CaidenSkillTracker() {
  return (
    <div className="caiden-skillTrackerWrap">
      <FocusSkillsSnapshot />
      <div className="caiden-skillQuestList">
        {QUEST_SKILLS.map((quest) => (
          <article key={quest.questNumber} className="caiden-skillQuestCard">
            <h3 className="caiden-skillQuestTitle">
              {quest.title}: {quest.category}
            </h3>
            <ul className="caiden-skillQuestTags">
              {quest.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
