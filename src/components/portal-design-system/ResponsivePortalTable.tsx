import React from 'react';
import { MobileDataAccordionItem, MobileDataAccordionList } from './MobileDataAccordion';
import './mobile-data-accordion.css';

export type ResponsivePortalTableMobileRole =
  | 'primary'
  | 'secondary'
  | 'metric'
  | 'detail'
  | 'hidden';

export type ResponsivePortalTableColumn<T> = {
  id: string;
  header: string;
  render: (row: T) => React.ReactNode;
  mobileRole?: ResponsivePortalTableMobileRole;
  /** Expanded-field label; defaults to header */
  mobileLabel?: string;
  /** Include in mobile expanded details even when used in collapsed summary */
  includeInMobileDetail?: boolean;
  /** Shown only in mobile accordion details, not in desktop table */
  mobileOnly?: boolean;
  className?: string;
};

type ResponsivePortalTableProps<T> = {
  columns: ResponsivePortalTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  tableClassName?: string;
  wrapClassName?: string;
  emptyMessage?: string;
  mobileAriaLabel?: string;
  expandedActions?: (row: T) => React.ReactNode;
  /** Mobile list layout: grouped flat rows inside a parent card, or standalone per-row cards */
  mobileListVariant?: 'grouped' | 'standalone';
};

type ResolvedColumn<T> = ResponsivePortalTableColumn<T> & {
  mobileRole: ResponsivePortalTableMobileRole;
};

function resolveMobileRoles<T>(columns: ResponsivePortalTableColumn<T>[]): ResolvedColumn<T>[] {
  const visible = columns.filter((column) => column.mobileRole !== 'hidden');
  const roleOrder: ResponsivePortalTableMobileRole[] = ['primary', 'secondary', 'metric'];
  let autoRoleIndex = 0;

  return visible.map((column) => {
    if (column.mobileRole) {
      return { ...column, mobileRole: column.mobileRole };
    }
    const role = autoRoleIndex < roleOrder.length ? roleOrder[autoRoleIndex] : 'detail';
    autoRoleIndex += 1;
    return { ...column, mobileRole: role };
  });
}

function findColumn<T>(columns: ResolvedColumn<T>[], role: ResponsivePortalTableMobileRole) {
  return columns.find((column) => column.mobileRole === role);
}

export default function ResponsivePortalTable<T>({
  columns,
  rows,
  rowKey,
  tableClassName = '',
  wrapClassName = '',
  emptyMessage,
  mobileAriaLabel = 'Data table rows',
  expandedActions,
  mobileListVariant = 'grouped',
}: ResponsivePortalTableProps<T>) {
  if (rows.length === 0) {
    return emptyMessage ? <p className="responsivePortalTableEmpty">{emptyMessage}</p> : null;
  }

  const resolvedColumns = resolveMobileRoles(columns);
  const desktopColumns = columns.filter((column) => column.mobileRole !== 'hidden' && !column.mobileOnly);
  const primaryColumn = findColumn(resolvedColumns, 'primary');
  const secondaryColumn = findColumn(resolvedColumns, 'secondary');
  const metricColumn = findColumn(resolvedColumns, 'metric');
  const detailColumns = resolvedColumns.filter(
    (column) =>
      column.mobileRole === 'detail' ||
      (column.includeInMobileDetail &&
        (column.mobileRole === 'primary' ||
          column.mobileRole === 'secondary' ||
          column.mobileRole === 'metric')),
  );

  return (
    <div className={['responsivePortalTable', wrapClassName].filter(Boolean).join(' ')}>
      <div className="responsivePortalTableDesktop">
        <table className={tableClassName}>
          <thead>
            <tr>
              {desktopColumns.map((column) => (
                <th key={column.id} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {desktopColumns.map((column) => (
                  <td key={column.id} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="responsivePortalTableMobile">
        <MobileDataAccordionList
          aria-label={mobileAriaLabel}
          className={
            mobileListVariant === 'standalone' ? 'mobileDataAccordionList--standalone' : 'mobileDataAccordionList--grouped'
          }
        >
          {rows.map((row) => {
            const key = rowKey(row);
            const actions = expandedActions?.(row);

            return (
              <MobileDataAccordionItem
                key={key}
                id={key}
                primary={primaryColumn ? primaryColumn.render(row) : '—'}
                secondary={secondaryColumn ? secondaryColumn.render(row) : undefined}
                metric={metricColumn ? metricColumn.render(row) : undefined}
                details={detailColumns.map((column) => ({
                  id: column.id,
                  label: column.mobileLabel ?? column.header,
                  value: column.render(row),
                }))}
                actions={actions}
              />
            );
          })}
        </MobileDataAccordionList>
      </div>
    </div>
  );
}
