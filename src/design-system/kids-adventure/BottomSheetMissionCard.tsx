import React from 'react';
import {
  resolveCharacterThemeId,
  themeDataAttributes,
  type CharacterThemeId,
} from './characterThemes';
import KidsAdventureIcon from './KidsAdventureIcon';

type BottomSheetMissionCardProps = {
  characterName: string;
  title: string;
  rewardText?: string;
  thumbnailSrc?: string;
  themeId?: CharacterThemeId | string | null;
  selected?: boolean;
  complete?: boolean;
  locked?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
};

export default function BottomSheetMissionCard({
  characterName,
  title,
  rewardText,
  thumbnailSrc,
  themeId,
  selected = false,
  complete = false,
  locked = false,
  onSelect,
  children,
}: BottomSheetMissionCardProps) {
  const resolvedTheme = resolveCharacterThemeId(themeId ?? characterName);
  const themeAttrs = resolvedTheme ? themeDataAttributes(resolvedTheme) : {};

  return (
    <li className="kidBottomSheetMissionWrap">
      <button
        type="button"
        className={[
          'kidBottomSheetMissionCard',
          'courageMissionListRow',
          selected ? 'courageMissionListRow--selected' : '',
          complete ? 'courageMissionListRow--complete' : '',
          locked ? 'courageMissionListRow--locked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...themeAttrs}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="courageMissionListRowThumb">
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt="" width={44} height={44} loading="lazy" />
          ) : (
            <KidsAdventureIcon name="adventures" size={28} />
          )}
        </span>
        <span className="courageMissionListRowCopy">
          <span className="courageMissionListRowTitle">{title}</span>
          {rewardText ? (
            <span className="courageMissionListRowReward">{rewardText}</span>
          ) : null}
        </span>
        <span className="courageMissionListRowStatus" aria-hidden="true">
          {complete ? (
            <span className="courageMissionListRowBadge">
              <KidsAdventureIcon name="check" size={18} />
            </span>
          ) : locked ? (
            <span className="courageMissionListRowLock">
              <KidsAdventureIcon name="lock" size={18} />
            </span>
          ) : (
            <span className="courageMissionListRowChevron">›</span>
          )}
        </span>
      </button>
      {selected && children ? (
        <div className="courageMissionListRowActions">{children}</div>
      ) : null}
    </li>
  );
}
