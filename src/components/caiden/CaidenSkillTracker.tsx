import React from 'react';
import '../focus-skills/focus-skills-snapshot.css';
import './caiden-quest-hub.css';

const CAIDEN_SEL_QUEST_SKILLS = [
  {
    questNumber: 1,
    category: 'Prioritization',
    skills: ['Planning', 'First Steps', 'Organization'],
  },
  {
    questNumber: 2,
    category: 'Attention Control',
    skills: ['Focus', 'Distraction Awareness', 'Environment'],
  },
  {
    questNumber: 3,
    category: 'Time Management',
    skills: ['Estimating Time', 'Scheduling', 'Urgency'],
  },
  {
    questNumber: 4,
    category: 'Emotional Regulation',
    skills: ['Reset', 'Flexible Thinking', 'Growth Mindset'],
  },
  {
    questNumber: 5,
    category: 'Planning & Organization',
    skills: ['Checklists', 'Step Order', 'Project Planning'],
  },
  {
    questNumber: 6,
    category: 'Budgeting & Self-Control',
    skills: ['Planning Purchases', 'Impulse Control', 'Saving Strategies'],
  },
  {
    questNumber: 7,
    category: 'Organization & Readiness',
    skills: ['Checklists', 'Supply Planning', 'Responsibility'],
  },
  {
    questNumber: 8,
    category: 'Time Management',
    skills: ['Prioritization', 'Scheduling', 'Focus Blocks'],
  },
  {
    questNumber: 9,
    category: 'Leadership & Teamwork',
    skills: ['Communication', 'Conflict Resolution', 'Courage'],
  },
] as const;

export default function CaidenSkillTracker() {
  return (
    <section className="caiden-skillTrackerWrap" aria-labelledby="caiden-sel-skills-heading">
      <h2 id="caiden-sel-skills-heading" className="caiden-skillTrackerHeading">
        SEL Skills You&apos;re Building
      </h2>
      <div className="caiden-skillQuestList">
        {CAIDEN_SEL_QUEST_SKILLS.map((quest) => (
          <article key={quest.questNumber} className="caiden-skillQuestCard">
            <h3 className="caiden-skillQuestTitle">
              Quest {quest.questNumber}: {quest.category}
            </h3>
            <ul className="caiden-skillQuestTags">
              {quest.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
