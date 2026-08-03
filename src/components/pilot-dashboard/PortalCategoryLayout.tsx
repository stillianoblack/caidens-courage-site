import React from 'react';

export type PortalCategoryItem<T extends string> = {
  id: T;
  label: string;
};

type PortalCategoryLayoutProps<T extends string> = {
  items: readonly PortalCategoryItem<T>[];
  activeItem: T;
  ariaLabel: string;
  onSelect: (item: T) => void;
  children: React.ReactNode;
};

export default function PortalCategoryLayout<T extends string>({
  items,
  activeItem,
  ariaLabel,
  onSelect,
  children,
}: PortalCategoryLayoutProps<T>) {
  const panelId = `${ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-panel`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    onSelect(items[nextIndex].id);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  };

  return (
    <div className="pilot-activitiesLayout">
      <div className="pilot-activitiesCategories" role="tablist" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeItem === item.id}
            aria-controls={panelId}
            tabIndex={activeItem === item.id ? 0 : -1}
            className={`pilot-activityCatBtn${activeItem === item.id ? ' pilot-activityCatBtn--active' : ''}`}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={panelId} className="pilot-activitiesAssets" role="tabpanel" aria-live="polite">
        {children}
      </div>
    </div>
  );
}
