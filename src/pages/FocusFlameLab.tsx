import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import FocusFlameGame, { type FocusFlameScene } from '../components/focus-flame-lab/FocusFlameGame';
import { FFL_EMBER_PRESETS } from '../components/focus-flame-lab/fflEmberPresets';

export default function FocusFlameLabPage() {
  const publicUrl = process.env.PUBLIC_URL || '';

  const scenes = useMemo<FocusFlameScene[]>(
    () => [
      {
        id: 'move',
        title: 'The Path',
        blurb: 'Caiden feels out of place on a new path.',
        momentCopy:
          'Caiden steps into a new place. Everything feels different. His thoughts start moving faster than his feet.',
        videoSrc: `${publicUrl}/videos/focus-flame/the-path.mp4`,
        tapVideoSequence: [
          `${publicUrl}/videos/focus-flame/the-path.mp4`,
          `${publicUrl}/videos/focus-flame/tap/path_tap_1.mp4`,
          `${publicUrl}/videos/focus-flame/tap/path-tap-2.mp4`,
          `${publicUrl}/videos/focus-flame/tap/path-tap-3.mp4`,
        ],
        thumbnail: `${publicUrl}/images/focus-flame-lab/thepath.webp`,
        cardImageSrc: `${publicUrl}/images/focus-flame-lab/thepath.webp`,
        cardImageAlt: 'Caiden on The Path',
        cardBadgeTone: 'blue',
      },
      {
        id: 'ceremony',
        title: 'The Camp',
        blurb: 'Caiden feels overwhelmed when all eyes are on him at camp.',
        momentCopy:
          'The camp gets loud. Everyone seems to be watching Caiden. His Focus Flame begins to flicker.',
        videoSrc: `${publicUrl}/videos/focus-flame/the-camp.mp4`,
        thumbnail: `${publicUrl}/images/focus-flame-lab/themove_intro_image.webp`,
        cardImageSrc: `${publicUrl}/images/focus-flame-lab/themove_intro_image.webp`,
        cardImageAlt: 'Caiden at The Camp',
        cardBadgeTone: 'gold',
      },
      {
        id: 'cave',
        title: 'The Cave',
        blurb: 'Caiden has to listen to his body and trust himself.',
        momentCopy: 'The cave feels darker than before. Strange sounds echo around Caiden.',
        videoSrc: `${publicUrl}/videos/focus-flame/the-cave.mp4`,
        thumbnail: `${publicUrl}/images/focus-flame-lab/thecave_block_image.webp`,
        // TODO: If these files aren’t deployed here, they also exist as `/images/characters/*_block_image.webp`.
        cardImageSrc: `${publicUrl}/images/focus-flame-lab/thecave_block_image.webp`,
        cardImageAlt: 'Caiden in The Cave scene',
        cardBadgeTone: 'violet',
      },
    ],
    [publicUrl]
  );

  return (
    <main
      className="ffl-app"
      aria-label="Focus Flame Lab"
      style={{
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ['--ffl-app-bg' as any]: `url(${publicUrl}/images/backgrounds/focusflame_game_background.webp)`,
      }}
    >
      <div className="ffl-background-depth" aria-hidden="true" />
      <div className="ffl-background-altarGlow" aria-hidden="true" />
      <div className="ffl-background-embers" aria-hidden="true">
        {FFL_EMBER_PRESETS.map((p, i) => (
          <span
            key={i}
            className="ffl-ember"
            style={
              {
                '--ember-x': `${p.x}%`,
                '--ember-delay': `${p.delayS}s`,
                '--ember-dur': `${p.durS}s`,
                '--ember-drift': `${p.driftPx}px`,
                '--ember-s': `${p.sizePx}px`,
                '--ember-o': p.opacity,
                '--ember-bg': p.warm ? 'rgba(240, 185, 95, 0.5)' : 'rgba(236, 150, 72, 0.38)',
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <FocusFlameGame
        scenes={scenes}
        parentsLink={
          <Link to="/training-guides" className="ffl-nav-button">
            For parents &amp; teachers
          </Link>
        }
        getBookHref="/#preorder"
      />
    </main>
  );
}
