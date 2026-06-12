import React from 'react';

const DIMENSIONS = [
  {
    name: 'audience',
    values: ['kid', 'family', 'facilitator', 'adult'],
    description: 'Who the content is designed for. Adult instructional modules use facilitator or adult.',
  },
  {
    name: 'gradeBand',
    values: ['K-1', '2-3', '4-5', '6-8', 'adult'],
    description:
      'Difficulty/readiness level. Kid bands adapt by participant grade. Adult content uses gradeBand = adult — never 6-8.',
  },
  {
    name: 'character',
    values: ['caiden', 'miranda', 'charlie', 'b4', 'zeke', 'uncle-t', 'dr-victoria', '…'],
    description: 'Story character or guide associated with the module.',
  },
  {
    name: 'skillArea',
    values: ['focus', 'reading', 'feelings', 'coaching', 'understanding', '…'],
    description: 'Primary SEL or instructional skill domain.',
  },
  {
    name: 'contentVersion',
    values: ['adaptive_v1', 'legacy_reclassified', 'adult_normalized', 'static_unbanded'],
    description: 'Provenance tag for audit and migration tracking.',
  },
];

export default function ContentClassificationSection() {
  return (
    <section id="content-classification" className="dsPageSection">
      <h2 className="dsPageSectionTitle">Content Classification System</h2>
      <p className="dsPageSectionLead">
        Kid adaptive quests (Caiden, Miranda) and adult facilitator training (Uncle T, Dr. Victoria)
        use separate classification pools. Adult content is <strong>not</strong> mapped to kid 6-8
        bands.
      </p>

      <div className="dsPageCardGrid">
        {DIMENSIONS.map((dim) => (
          <article key={dim.name} className="dsPageCard">
            <h3 className="dsPageCardTitle">
              <code>{dim.name}</code>
            </h3>
            <p className="dsPageCardBody">{dim.description}</p>
            <ul className="dsPageList">
              {dim.values.map((value) => (
                <li key={value}>
                  <code>{value}</code>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="dsPageCallout">
        <h3 className="dsPageCalloutTitle">Kid vs adult</h3>
        <ul className="dsPageList">
          <li>
            <strong>Kid content</strong> — audience <code>kid</code>, gradeBand K-1 through 6-8.
            Resolved by <code>resolveKidGradeBandWithFallback</code>.
          </li>
          <li>
            <strong>Adult content</strong> — audience <code>facilitator</code>, gradeBand{' '}
            <code>adult</code>. Uncle T uses <code>adult_guidance</code>; Dr. Victoria uses{' '}
            <code>adult_reflection</code>.
          </li>
          <li>
            Kid and adult pools <strong>never cross-fallback</strong>.
          </li>
        </ul>
        <p className="dsPageHelper">
          Audit: <code>node scripts/normalizeAdultContent.mjs</code> ·{' '}
          <code>node scripts/auditGradeBandContent.mjs</code>
        </p>
      </div>
    </section>
  );
}
