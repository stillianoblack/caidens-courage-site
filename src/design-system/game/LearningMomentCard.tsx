import React from 'react';
import AvatarContainer, { type AvatarContainerVariant } from '../components/AvatarContainer';
import { LEARNING_MOMENT_VARIANTS } from '../components/learningMomentCard.registry';
import { getCharacter } from '../characters/characterRegistry';
import CoachingRailShell from './CoachingRailShell';

export type LearningMomentVariant = 'B4_LOCK_IN' | 'B4_PARENT_COACH' | 'FACILITATOR_INSIGHT';

/** @deprecated Use LearningMomentVariant */
export type LegacyLearningMomentVariant =
  | 'b4_tip'
  | 'expert_insight'
  | 'character_reflection'
  | 'parent_note';

export type LearningMomentAvatarType = 'b4' | 'dr-victoria';

export type LearningMomentCardProps = {
  variant: LearningMomentVariant | LegacyLearningMomentVariant;
  /** Badge label above headline */
  title?: string;
  /** Primary coaching message (alias: message) */
  headline?: string;
  /** @deprecated Use headline */
  message?: string;
  /** Supporting body copy below headline */
  body?: string;
  /** Bullet tips — primarily for B4_LOCK_IN */
  tips?: string[];
  whyItMatters?: string;
  tryThis?: string[];
  tryThisLabel?: string;
  watchFor?: string;
  avatarType?: LearningMomentAvatarType;
  avatarSrc?: string;
  /** @deprecated Variant determines avatar; kept for legacy callers */
  characterId?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  /** Show left chevron connecting rail to question/answer zone */
  showRailChevron?: boolean;
  caretTop?: number;
  tipsLabel?: string;
  numberedTips?: boolean;
  collapsibleOnMobile?: boolean;
};

function normalizeVariant(
  variant: LearningMomentVariant | LegacyLearningMomentVariant,
): LearningMomentVariant {
  switch (variant) {
    case 'b4_tip':
      return 'B4_LOCK_IN';
    case 'expert_insight':
      return 'FACILITATOR_INSIGHT';
    case 'parent_note':
      return 'B4_PARENT_COACH';
    case 'character_reflection':
      return 'B4_LOCK_IN';
    default:
      return variant;
  }
}

function resolveAvatar(
  variant: LearningMomentVariant,
  avatarType?: LearningMomentAvatarType,
  avatarSrc?: string,
  title?: string,
): { src: string; alt: string; containerVariant: AvatarContainerVariant } {
  const meta = LEARNING_MOMENT_VARIANTS[variant];
  const type = avatarType ?? meta.avatarType;
  const character = getCharacter(type === 'b4' ? 'b4' : 'dr-victoria');
  const resolvedSrc = avatarSrc ?? character?.avatarSrc ?? '';
  const usesCustomExpertAvatar =
    variant === 'FACILITATOR_INSIGHT' &&
    Boolean(avatarSrc) &&
    avatarSrc !== character?.avatarSrc;

  return {
    src: resolvedSrc,
    alt: title?.replace(/ says$/i, '') ?? character?.displayName ?? (type === 'b4' ? 'B-4' : 'Dr. Victoria'),
    containerVariant: usesCustomExpertAvatar
      ? 'default'
      : type === 'b4'
        ? 'b4'
        : 'dr-victoria',
  };
}

function defaultTryThisLabel(variant: LearningMomentVariant): string {
  return variant === 'B4_PARENT_COACH' ? 'Try this at home' : 'Try this';
}

export default function LearningMomentCard({
  variant: rawVariant,
  title,
  headline,
  message,
  body,
  tips = [],
  whyItMatters,
  tryThis,
  tryThisLabel,
  watchFor,
  avatarType,
  avatarSrc,
  actionLabel,
  onAction,
  className = '',
  showRailChevron = false,
  caretTop,
  tipsLabel,
  numberedTips = true,
  collapsibleOnMobile = false,
}: LearningMomentCardProps) {
  const variant = normalizeVariant(rawVariant);
  const meta = LEARNING_MOMENT_VARIANTS[variant];
  const resolvedHeadline = headline ?? message ?? '';
  const badge = title ?? meta.defaultTitle;
  const avatar = resolveAvatar(variant, avatarType, avatarSrc, badge);
  const sectionTryLabel = tryThisLabel ?? defaultTryThisLabel(variant);
  const resolvedTipsLabel = tipsLabel ?? (variant === 'B4_LOCK_IN' ? 'Try this next' : undefined);
  const [mobileExpanded, setMobileExpanded] = React.useState(false);

  const showTips = tips.length > 0;
  const showWhy = Boolean(whyItMatters);
  const showTry = Boolean(tryThis && tryThis.length > 0);
  const showWatch = Boolean(watchFor);
  const showSections = showTips || showWhy || showTry || showWatch;

  const shellVariant =
    variant === 'B4_LOCK_IN' ? 'b4' : variant === 'FACILITATOR_INSIGHT' ? 'facilitator' : 'placeholder';

  const b4TipsBlock =
    showTips && variant === 'B4_LOCK_IN' ? (
      <div className="ds-learningMomentTipsBlock">
        {resolvedTipsLabel ? (
          <p className="ds-learningMomentTipsLabel">{resolvedTipsLabel}</p>
        ) : null}
        {numberedTips ? (
          <ol className="ds-learningMomentTips ds-learningMomentTips--numbered">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        ) : (
          <ul className="ds-learningMomentTips">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
      </div>
    ) : null;

  const card = (
    <aside
      className={['ds-learningMoment', `ds-learningMoment--${variant}`, className].filter(Boolean).join(' ')}
      aria-live="polite"
      aria-label={badge}
    >
      {variant === 'B4_LOCK_IN' ? (
        <>
          <div className="ds-learningMomentB4Top">
            {avatar.src ? (
              <AvatarContainer src={avatar.src} alt={avatar.alt} variant={avatar.containerVariant} />
            ) : null}
            <p className="ds-learningMomentBadge">{badge}</p>
          </div>
          {resolvedHeadline ? (
            <p className="ds-learningMomentHeadline">{resolvedHeadline}</p>
          ) : null}
          {collapsibleOnMobile ? (
            <button
              type="button"
              className="ds-learningMomentMobileToggle"
              aria-expanded={mobileExpanded}
              onClick={() => setMobileExpanded((open) => !open)}
            >
              B-4 Tip
            </button>
          ) : null}
          {(!collapsibleOnMobile || mobileExpanded) && body ? (
            <p className="ds-learningMomentBody">{body}</p>
          ) : null}
          {(!collapsibleOnMobile || mobileExpanded) ? b4TipsBlock : null}
        </>
      ) : (
        <>
          <div className="ds-learningMomentRow">
            {avatar.src ? (
              <AvatarContainer src={avatar.src} alt={avatar.alt} variant={avatar.containerVariant} />
            ) : null}
            <div className="ds-learningMomentContent">
              <p className="ds-learningMomentBadge">{badge}</p>
              {resolvedHeadline ? (
                <p className="ds-learningMomentHeadline">{resolvedHeadline}</p>
              ) : null}
              {body ? <p className="ds-learningMomentBody">{body}</p> : null}
            </div>
          </div>

          {showSections ? (
            <div className="ds-learningMomentSections">
              {showWhy ? (
                <div>
                  <p className="ds-learningMomentSectionTitle">Why it matters</p>
                  <p className="ds-learningMomentSectionText">{whyItMatters}</p>
                </div>
              ) : null}

              {showTry ? (
                <div>
                  <p className="ds-learningMomentSectionTitle">{sectionTryLabel}</p>
                  <ul className="ds-learningMomentTips">
                    {tryThis!.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {showWatch ? (
                <div>
                  <p className="ds-learningMomentSectionTitle">Watch for</p>
                  <p className="ds-learningMomentSectionText">{watchFor}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {actionLabel && onAction ? (
        <div className="ds-learningMomentAction">
          <button type="button" className="ds-learningMomentBtn" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </aside>
  );

  if (showRailChevron) {
    return (
      <CoachingRailShell variant={shellVariant} caretTop={caretTop}>
        {card}
      </CoachingRailShell>
    );
  }

  return card;
}
