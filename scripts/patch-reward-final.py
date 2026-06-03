#!/usr/bin/env python3
"""Patch FocusFlameRewardThreeZone for cleaner reward hierarchy."""
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'src/components/focus-flame-lab/FocusFlameRewardThreeZone.tsx'
t = p.read_text()

# Imports and props
t = t.replace(
    "import MobileSceneStatus from './MobileSceneStatus';\n\ntype Feeling",
    "import MobileSceneStatus from './MobileSceneStatus';\nimport { focusFlameRankLabel } from './focusFlameRanks';\n\ntype Feeling",
)
t = t.replace('const TOTAL_FOCUS_POINTS = 40;\n', '')
t = t.replace('  body,\n  getBookHref,', '  body,\n  focusPoints,\n  getBookHref,')
t = t.replace('  body: BodySignal | null;\n  getBookHref', '  body: BodySignal | null;\n  focusPoints: number;\n  getBookHref')
t = t.replace(
    '  const journeyScenes = [...scenes].sort(\n    (a, b) => SCENE_ORDER.indexOf(a.id) - SCENE_ORDER.indexOf(b.id)\n  );\n\n  return (',
    '  const journeyScenes = [...scenes].sort(\n    (a, b) => SCENE_ORDER.indexOf(a.id) - SCENE_ORDER.indexOf(b.id)\n  );\n  const rankLabel = focusFlameRankLabel(focusPoints);\n\n  return (',
)
t = t.replace(
    'message="Great job. Your Focus Flame is getting stronger."',
    'message="You did it. Want to try another moment?"',
)

# Hero header
old_hero = """          <header className="ffl-reward-hero-intro">
            <p className="ffl-reward-eyebrow">CONGRATS, CAIDEN!</p>
            <h2 className="ffl-h2 ffl-reward-hero-title">Caiden’s flame stabilized.</h2>
            <p className="ffl-p ffl-reward-hero-sub">You helped Caiden notice what was happening.</p>
            <p className="ffl-reward-hero-meta">
              Feeling: <span className="ffl-strong">{clamp(feeling, '—')}</span> · Body signal:{' '}
              <span className="ffl-strong">{clamp(body, '—')}</span>
            </p>
          </header>"""

new_hero = """          <header className="ffl-reward-hero-intro">
            <h2 className="ffl-h2 ffl-reward-hero-title">Caiden’s flame stabilized.</h2>
            <motion>
              <span className="ffl-reward-hero-points-value" aria-label={`${focusPoints} Focus Points`}>
                +{focusPoints}
              </span>
              <span className="ffl-reward-hero-points-label">Focus Points</span>
            </motion>
            <p className="ffl-reward-hero-rank">Rank: {rankLabel}</p>
            <p className="ffl-reward-hero-meta">
              Feeling: <span className="ffl-strong">{clamp(feeling, '—')}</span> · Body signal:{' '}
              <span className="ffl-strong">{clamp(body, '—')}</span>
            </p>
          </header>""".replace('motion', 'div')

t = t.replace(old_hero, new_hero)

# Kids card + remove parents - find markers
start = t.index('          <div className="ffl-reward-card-row">')
end = t.index('        </main>', start)

new_card = """          <div className="ffl-reward-card-row ffl-reward-card-row--single">
            <section
              className="ffl-reward-surface-card ffl-reward-surface-card--kids ffl-kid-card"
              aria-labelledby="ffl-reward-kids-title"
            >
              <h3 id="ffl-reward-kids-title" className="ffl-reward-surface-title">
                Your reward
              </h3>
              <p className="ffl-reward-kids-copy">
                You earned Focus Points for helping Caiden practice courage.
              </p>
              <div className="ffl-reward-badge-row" role="list">
                <div role="listitem">
                  <KidsBadgeTile src={icons.noticing} alt="Noticing badge" label="Noticing" />
                </div>
                <div role="listitem">
                  <KidsBadgeTile src={icons.body} alt="Body badge" label="Body" />
                </motion>
                <div role="listitem">
                  <KidsBadgeTile src={icons.draw} alt="Draw badge" label="Draw" />
                </motion>
              </motion>
              <div className="ffl-reward-cta-stack">
                <button
                  type="button"
                  className="ffl-ctaPrimary ffl-primary-button ffl-reward-kids-cta ffl-try-new-scene-button"
                  onClick={onTryNewScene}
                >
                  Try a new scene
                </button>
                <a
                  className="ffl-ctaSecondary ffl-reward-cert-download"
                  href={certificatePdfHref}
                  download="focus-flame-certificate.pdf"
                  onClick={() => {
                    onPlayButtonClick();
                  }}
                >
                  Download Kid Certificate
                </a>
                <a
                  className="ffl-reward-book-link ffl-reward-book-link--tertiary"
                  href={getBookHref || '/#preorder'}
                  onClick={() => {
                    onPlayButtonClick();
                  }}
                >
                  Get the book
                </a>
              </motion>
            </section>
          </motion>""".replace('motion', 'motion')

new_card = new_card.replace('motion', 'div')

t = t[:start] + new_card + '\n' + t[end:]

# Journey panel
t = t.replace(
    '<aside className="ffl-reward-ambient" aria-label="Journey reflection">',
    '<aside className="ffl-reward-ambient ffl-reward-journey-panel" aria-label="Journey">',
)
t = t.replace(
    '          <blockquote className="ffl-reward-ambient-b4">\n'
    '            Every brave step makes your flame shine brighter.\n'
    '          </blockquote>\n',
    '',
)
t = t.replace('Your journey', 'Journey')

p.write_text(t)
print('written ok')
