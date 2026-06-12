import React from 'react';
import { Link } from 'react-router-dom';
import SlideOutDrawer from '../../components/portal-design-system/SlideOutDrawer';
import type { B4InsightsDrawerProps } from '../../types/b4Insights';
import './b4-insights-drawer.css';

function InsightToneClass(tone?: string): string {
  if (tone === 'strength') return 'ds-b4Insights-insight--strength';
  if (tone === 'attention') return 'ds-b4Insights-insight--attention';
  if (tone === 'progress') return 'ds-b4Insights-insight--progress';
  if (tone === 'setup') return 'ds-b4Insights-insight--setup';
  return '';
}

export default function B4InsightsDrawer({
  isOpen,
  onClose,
  portalType,
  title,
  eyebrow = 'B-4 Insights',
  childName,
  programName,
  avatarImage,
  heroImage,
  summary,
  insights,
  recommendations,
  nextActions,
  metrics,
  footerNote = 'B-4 insights are based on completed activities and check-ins.',
}: B4InsightsDrawerProps) {
  const primaryAction = nextActions.find((action) => action.variant === 'primary') ?? nextActions[0];
  const secondaryActions = nextActions.filter((action) => action !== primaryAction);

  return (
    <SlideOutDrawer
      open={isOpen}
      onClose={onClose}
      titleId="b4-insights-title"
      size="large"
      className={`pilot-drawer ds-b4InsightsDrawer ds-b4InsightsDrawer--${portalType}`}
    >
      <div className="ds-b4Insights">
        <header className="ds-b4Insights-hero">
          <div className="ds-b4Insights-heroVisual" aria-hidden="true">
            {heroImage ? (
              <img className="ds-b4Insights-heroImage" src={heroImage} alt="" decoding="async" />
            ) : (
              <img className="ds-b4Insights-heroAvatar" src={avatarImage} alt="" decoding="async" />
            )}
            <div className="ds-b4Insights-heroMask" />
          </div>
          <div className="ds-b4Insights-heroCopy">
            <div className="ds-b4Insights-heroTop">
              <div>
                <p className="ds-b4Insights-eyebrow">{eyebrow}</p>
                <h2 id="b4-insights-title" className="ds-b4Insights-title">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                className="ds-b4Insights-close"
                onClick={onClose}
                aria-label="Close B-4 insights"
              >
                ×
              </button>
            </div>
            {(childName || programName) && (
              <div className="ds-b4Insights-badges">
                {childName ? <span className="ds-b4Insights-badge">{childName}</span> : null}
                {programName ? (
                  <span className="ds-b4Insights-badge ds-b4Insights-badge--muted">{programName}</span>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <div className="ds-b4Insights-body">
          <section className="ds-b4Insights-section">
            <h3 className="ds-b4Insights-sectionTitle">Summary</h3>
            <p className="ds-b4Insights-summary">{summary}</p>
          </section>

          {insights.length > 0 ? (
            <section className="ds-b4Insights-section">
              <h3 className="ds-b4Insights-sectionTitle">What B-4 Notices</h3>
              <ul className="ds-b4Insights-insightList">
                {insights.map((item) => (
                  <li
                    key={item.id}
                    className={`ds-b4Insights-insight ${InsightToneClass(item.tone)}`.trim()}
                  >
                    <strong>{item.label}</strong>
                    {item.detail ? <span>{item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recommendations.length > 0 ? (
            <section className="ds-b4Insights-section">
              <h3 className="ds-b4Insights-sectionTitle">Recommendations</h3>
              <ul className="ds-b4Insights-recommendationList">
                {recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {primaryAction ? (
            <section className="ds-b4Insights-section ds-b4Insights-section--cta">
              <h3 className="ds-b4Insights-sectionTitle">Recommended Next Action</h3>
              <div className="ds-b4Insights-actions">
                {primaryAction.href ? (
                  <Link
                    to={primaryAction.href}
                    className="ds-b4Insights-action ds-b4Insights-action--primary"
                    onClick={() => {
                      primaryAction.onClick?.();
                      onClose();
                    }}
                  >
                    {primaryAction.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="ds-b4Insights-action ds-b4Insights-action--primary"
                    onClick={() => {
                      primaryAction.onClick?.();
                      onClose();
                    }}
                  >
                    {primaryAction.label}
                  </button>
                )}
                {secondaryActions.map((action) =>
                  action.href ? (
                    <Link
                      key={action.id}
                      to={action.href}
                      className="ds-b4Insights-action ds-b4Insights-action--secondary"
                      onClick={() => {
                        action.onClick?.();
                        onClose();
                      }}
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={action.id}
                      type="button"
                      className="ds-b4Insights-action ds-b4Insights-action--secondary"
                      onClick={() => {
                        action.onClick?.();
                        onClose();
                      }}
                    >
                      {action.label}
                    </button>
                  ),
                )}
              </div>
            </section>
          ) : null}

          {metrics.length > 0 ? (
            <section className="ds-b4Insights-section">
              <h3 className="ds-b4Insights-sectionTitle">Supporting Metrics</h3>
              <div className="ds-b4Insights-metrics">
                {metrics.map((metric) => (
                  <article key={metric.label} className="ds-b4Insights-metric">
                    <p className="ds-b4Insights-metricLabel">{metric.label}</p>
                    <p className="ds-b4Insights-metricValue">{metric.value}</p>
                    {metric.hint ? <p className="ds-b4Insights-metricHint">{metric.hint}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {footerNote ? <p className="ds-b4Insights-footer">{footerNote}</p> : null}
        </div>
      </div>
    </SlideOutDrawer>
  );
}
