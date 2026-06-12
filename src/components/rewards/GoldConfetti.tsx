import React from 'react';
import './gold-confetti.css';

type GoldConfettiProps = {
  active: boolean;
};

const PARTICLE_LAYOUT = [
  { left: '8%', delay: '0s', width: '0.32rem', height: '0.42rem' },
  { left: '18%', delay: '0.04s', width: '0.28rem', height: '0.36rem' },
  { left: '28%', delay: '0.08s', width: '0.36rem', height: '0.48rem' },
  { left: '38%', delay: '0.02s', width: '0.3rem', height: '0.4rem' },
  { left: '48%', delay: '0.1s', width: '0.34rem', height: '0.44rem' },
  { left: '58%', delay: '0.06s', width: '0.28rem', height: '0.36rem' },
  { left: '68%', delay: '0.12s', width: '0.32rem', height: '0.42rem' },
  { left: '78%', delay: '0.03s', width: '0.36rem', height: '0.48rem' },
  { left: '88%', delay: '0.09s', width: '0.3rem', height: '0.4rem' },
  { left: '14%', delay: '0.14s', width: '0.34rem', height: '0.44rem' },
  { left: '44%', delay: '0.16s', width: '0.28rem', height: '0.36rem' },
  { left: '74%', delay: '0.18s', width: '0.32rem', height: '0.42rem' },
  { left: '24%', delay: '0.2s', width: '0.3rem', height: '0.4rem' },
  { left: '54%', delay: '0.22s', width: '0.36rem', height: '0.48rem' },
];

export default function GoldConfetti({ active }: GoldConfettiProps) {
  if (!active) return null;

  return (
    <div className="goldConfetti" aria-hidden="true">
      {PARTICLE_LAYOUT.map((particle, index) => (
        <span
          key={index}
          className="goldConfettiParticle"
          style={{
            left: particle.left,
            width: particle.width,
            height: particle.height,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
