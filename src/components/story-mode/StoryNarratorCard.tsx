import React from 'react';

type StoryNarratorCardProps = {
  eyebrow?: string;
  message: string;
};

export default function StoryNarratorCard({
  eyebrow = 'B-4 Guide',
  message,
}: StoryNarratorCardProps) {
  return (
    <aside className="storyNarratorCard" aria-label="B-4 guide">
      <img src="/images/Choose-Your-Guide/B-4student.webp" alt="" />
      <div>
        <span>{eyebrow}</span>
        <p>{message}</p>
      </div>
    </aside>
  );
}
