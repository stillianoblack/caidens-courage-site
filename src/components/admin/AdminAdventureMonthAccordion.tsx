import React, { useMemo, useState } from 'react';
import AdminImageField from './AdminImageField';
import AdminAdventureWeekInlineEditor from './AdminAdventureWeekInlineEditor';
import type { AdventureModuleInput, AdventureModuleRecord } from '../../types/adventureModule';
import type { AdventureMonthInput, AdventureMonthRecord } from '../../types/adventureMonth';
import type { AdventureAssetUploadKind } from '../../lib/adventureModuleService';
import {
  formatAdventureMonthLabel,
  groupModulesByMonth,
} from '../../lib/adventureMonthService';
import {
  formatAdminAdventureStatus,
  isVisibleOnLiveSite,
  type AdventureVisibilityContext,
} from '../../lib/adventureVisibility';

type AdminAdventureMonthAccordionProps = {
  months: AdventureMonthRecord[];
  modules: AdventureModuleRecord[];
  liveCtx: AdventureVisibilityContext;
  editingMonthId: string | null;
  inlineEditingId: string | null;
  inlineForm: AdventureModuleInput | null;
  monthForm: AdventureMonthInput | null;
  savingMonth: boolean;
  savingInline: boolean;
  uploadingMonthHero: boolean;
  uploadingMonthCertificate: boolean;
  uploadingInlineKind: AdventureAssetUploadKind | null;
  monthsFromFallback: boolean;
  onEditMonth: (month: AdventureMonthRecord) => void;
  onCancelMonthEdit: () => void;
  onSaveMonth: (event: React.FormEvent) => void;
  onMonthFormChange: (patch: Partial<AdventureMonthInput>) => void;
  onMonthHeroUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCertificateAssetUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditWeek: (module: AdventureModuleRecord) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineWeek: (event: React.FormEvent) => void;
  onInlineFormChange: (patch: Partial<AdventureModuleInput>) => void;
  onInlineImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: AdventureAssetUploadKind,
    field?: keyof AdventureModuleInput,
  ) => void;
  onMoveWeek: (module: AdventureModuleRecord, direction: -1 | 1) => void;
  onPreviewLive: (id: string) => void;
  onPreviewAdmin: (id: string) => void;
  onPublish: (id: string) => void;
  onSetFeatured: (module: AdventureModuleRecord) => void;
};

function formatUnlockDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminAdventureMonthAccordion({
  months,
  modules,
  liveCtx,
  editingMonthId,
  inlineEditingId,
  inlineForm,
  monthForm,
  savingMonth,
  savingInline,
  uploadingMonthHero,
  uploadingMonthCertificate,
  uploadingInlineKind,
  monthsFromFallback,
  onEditMonth,
  onCancelMonthEdit,
  onSaveMonth,
  onMonthFormChange,
  onMonthHeroUpload,
  onCertificateAssetUpload,
  onEditWeek,
  onCancelInlineEdit,
  onSaveInlineWeek,
  onInlineFormChange,
  onInlineImageUpload,
  onMoveWeek,
  onPreviewLive,
  onPreviewAdmin,
  onPublish,
  onSetFeatured,
}: AdminAdventureMonthAccordionProps) {
  const grouped = useMemo(() => groupModulesByMonth(modules, months), [modules, months]);
  const [openMonths, setOpenMonths] = useState<Record<number, boolean>>({ 1: true });

  const toggleMonth = (monthNumber: number) => {
    setOpenMonths((prev) => ({ ...prev, [monthNumber]: !prev[monthNumber] }));
  };

  return (
    <div className="adminAdventureMonths">
      {monthsFromFallback ? (
        <p className="adminPortal-helper" role="status">
          Using default month metadata. Run{' '}
          <code>supabase/adventure_months_migration.sql</code> and click Import Default Months to
          enable full month editing.
        </p>
      ) : null}

      {grouped.map(({ month, modules: monthModules }) => {
        const isOpen = openMonths[month.month_number] ?? false;
        const isEditingMonth = editingMonthId === month.id;
        const publishedCount = monthModules.filter((row) => row.status === 'active').length;
        const completedPreview = `${publishedCount}/${month.certificate_required_weeks} published weeks`;

        return (
          <section
            key={month.id}
            className={`adminAdventureMonthBlock${isOpen ? ' adminAdventureMonthBlock--open' : ''}`}
          >
            <button
              type="button"
              className="adminAdventureMonthToggle"
              aria-expanded={isOpen}
              onClick={() => toggleMonth(month.month_number)}
            >
              <span className="adminAdventureMonthToggleTitle">{formatAdventureMonthLabel(month)}</span>
              <span className="adminAdventureMonthToggleMeta">
                {month.is_published ? 'Published' : 'Draft'} · {completedPreview}
              </span>
            </button>

            {isOpen ? (
              <div className="adminAdventureMonthBody">
                <div className="adminAdventureMonthSummary">
                  <div className="adminAdventureMonthHeroPreview">
                    {month.month_hero_image_url ? (
                      <img src={month.month_hero_image_url} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <span className="adminAdventureMonthHeroPlaceholder">Month hero image</span>
                    )}
                  </div>
                  <div className="adminAdventureMonthMeta">
                    <p>
                      <strong>Certificate:</strong> {month.certificate_title || '—'}
                    </p>
                    <p>
                      <strong>Reward:</strong> {month.certificate_reward_name || '—'}
                    </p>
                    <p>
                      <strong>Required weeks:</strong> {month.certificate_required_weeks}
                    </p>
                    {month.certificate_asset_url ? (
                      <p>
                        <strong>Certificate asset:</strong>{' '}
                        {month.certificate_asset_type === 'pdf' ? 'PDF' : 'Image'}
                      </p>
                    ) : null}
                    <p className="adminAdventureMonthProgressPreview">{completedPreview}</p>
                    <button
                      type="button"
                      className="adminPortal-btn adminPortal-btn--ghost"
                      onClick={() => onEditMonth(month)}
                    >
                      {isEditingMonth ? 'Editing Month…' : 'Edit Month'}
                    </button>
                  </div>
                </div>

                {isEditingMonth && monthForm ? (
                  <form className="adminAdventureMonthForm" onSubmit={onSaveMonth}>
                    <div className="adminAdventureFormGrid">
                      <label className="adminPortal-field">
                        <span>Month title</span>
                        <input
                          value={monthForm.month_title}
                          onChange={(event) => onMonthFormChange({ month_title: event.target.value })}
                          required
                        />
                      </label>
                      <label className="adminPortal-field">
                        <span>Subtitle</span>
                        <input
                          value={monthForm.month_subtitle ?? ''}
                          onChange={(event) => onMonthFormChange({ month_subtitle: event.target.value })}
                        />
                      </label>
                      <label className="adminPortal-field adminPortal-field--full">
                        <span>Description / progress copy</span>
                        <textarea
                          value={monthForm.month_description ?? ''}
                          onChange={(event) =>
                            onMonthFormChange({ month_description: event.target.value })
                          }
                          rows={2}
                        />
                      </label>
                      <label className="adminPortal-field">
                        <span>Certificate title</span>
                        <input
                          value={monthForm.certificate_title ?? ''}
                          onChange={(event) =>
                            onMonthFormChange({ certificate_title: event.target.value })
                          }
                        />
                      </label>
                      <label className="adminPortal-field">
                        <span>Certificate reward name</span>
                        <input
                          value={monthForm.certificate_reward_name ?? ''}
                          onChange={(event) =>
                            onMonthFormChange({ certificate_reward_name: event.target.value })
                          }
                        />
                      </label>
                      <label className="adminPortal-field">
                        <span>Certificate required weeks</span>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={monthForm.certificate_required_weeks ?? 4}
                          onChange={(event) =>
                            onMonthFormChange({
                              certificate_required_weeks: Number(event.target.value) || 4,
                            })
                          }
                        />
                      </label>
                      <label className="adminPortal-field">
                        <span>Certificate asset type</span>
                        <select
                          value={monthForm.certificate_asset_type ?? 'image'}
                          onChange={(event) =>
                            onMonthFormChange({
                              certificate_asset_type: event.target.value as 'image' | 'pdf',
                            })
                          }
                        >
                          <option value="image">image</option>
                          <option value="pdf">pdf</option>
                        </select>
                      </label>
                      <label className="adminPortal-field">
                        <span>Sort order</span>
                        <input
                          type="number"
                          min={0}
                          value={monthForm.sort_order ?? month.month_number}
                          onChange={(event) =>
                            onMonthFormChange({ sort_order: Number(event.target.value) || 0 })
                          }
                        />
                      </label>
                      <label className="adminPortal-field adminPortal-field--checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(monthForm.is_published)}
                          onChange={(event) =>
                            onMonthFormChange({ is_published: event.target.checked })
                          }
                        />
                        <span>Published on family portal</span>
                      </label>
                    </div>

                    <AdminImageField
                      label="Month hero / world image"
                      hint="Large hero background for this month on Weekly Adventures."
                      value={monthForm.month_hero_image_url ?? ''}
                      uploading={uploadingMonthHero}
                      onChange={(value) => onMonthFormChange({ month_hero_image_url: value })}
                      onUpload={onMonthHeroUpload}
                    />

                    <label className="adminPortal-field">
                      <span>Certificate image/PDF URL</span>
                      <input
                        type="url"
                        value={monthForm.certificate_asset_url ?? ''}
                        onChange={(event) =>
                          onMonthFormChange({ certificate_asset_url: event.target.value })
                        }
                      />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        disabled={uploadingMonthCertificate}
                        onChange={onCertificateAssetUpload}
                      />
                    </label>

                    <div className="adminAdventureFormActions">
                      <button
                        type="submit"
                        className="adminPortal-btn adminPortal-btn--primary"
                        disabled={savingMonth || month.id.startsWith('fallback-')}
                      >
                        {savingMonth ? 'Saving…' : 'Save Month'}
                      </button>
                      <button
                        type="button"
                        className="adminPortal-btn adminPortal-btn--ghost"
                        onClick={onCancelMonthEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}

                <ul className="adminAdventureMonthWeekList">
                  {monthModules.map((module, index) => {
                    const isEditingInline = inlineEditingId === module.id && inlineForm;

                    return (
                      <li
                        key={module.id}
                        className={[
                          'adminAdventureMonthWeekItem',
                          isEditingInline ? 'adminAdventureMonthWeekItem--editing' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <div className="adminAdventureMonthWeekMain">
                          {module.thumbnail_image_url ? (
                            <img
                              src={module.thumbnail_image_url}
                              alt=""
                              className="adminAdventureThumb"
                              loading="lazy"
                            />
                          ) : (
                            <span className="adminAdventureThumb adminAdventureThumb--placeholder">
                              🗺️
                            </span>
                          )}
                          <div className="adminAdventureMonthWeekCopy">
                            <p className="adminAdventureMonthWeekLabel">Week {module.week_number}</p>
                            <strong>{module.title}</strong>
                            {module.subtitle ? (
                              <span className="adminAdventureTableSub">{module.subtitle}</span>
                            ) : null}
                            {module.weekly_reward_name ? (
                              <span className="adminAdventureMonthWeekReward">
                                Reward: {module.weekly_reward_name}
                              </span>
                            ) : null}
                          </div>
                          <div className="adminAdventureMonthWeekStatus">
                            <span
                              className={`adminAdventureStatus adminAdventureStatus--${module.status}`}
                            >
                              {formatAdminAdventureStatus(module.status)}
                            </span>
                            <span className="adminAdventureMonthWeekUnlock">
                              Unlock: {formatUnlockDate(module.unlock_date)}
                            </span>
                            <span>Live: {isVisibleOnLiveSite(module, liveCtx) ? 'Yes' : 'No'}</span>
                            <span>Sort: {module.sort_order}</span>
                            {module.is_featured ? (
                              <span className="adminAdventureFeaturedBadge">Featured</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="adminAdventureMonthWeekActions">
                          <button
                            type="button"
                            className="adminPortal-btn adminPortal-btn--ghost"
                            disabled={index === 0}
                            aria-label={`Move week ${module.week_number} up`}
                            onClick={() => onMoveWeek(module, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="adminPortal-btn adminPortal-btn--ghost"
                            disabled={index === monthModules.length - 1}
                            aria-label={`Move week ${module.week_number} down`}
                            onClick={() => onMoveWeek(module, 1)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className={`adminPortal-btn adminPortal-btn--ghost${isEditingInline ? ' adminPortal-btn--active' : ''}`}
                            onClick={() => onEditWeek(module)}
                          >
                            {isEditingInline ? 'Close' : 'Edit Week'}
                          </button>
                          {!isEditingInline ? (
                            <>
                              <button
                                type="button"
                                className="adminPortal-btn adminPortal-btn--ghost"
                                onClick={() => onPreviewLive(module.id)}
                              >
                                Preview Live
                              </button>
                              <button
                                type="button"
                                className="adminPortal-btn adminPortal-btn--ghost"
                                onClick={() => onPreviewAdmin(module.id)}
                              >
                                Preview Admin
                              </button>
                              {module.status !== 'active' ? (
                                <button
                                  type="button"
                                  className="adminPortal-btn adminPortal-btn--ghost"
                                  onClick={() => onPublish(module.id)}
                                >
                                  Publish
                                </button>
                              ) : null}
                              {!module.is_featured ? (
                                <button
                                  type="button"
                                  className="adminPortal-btn adminPortal-btn--ghost"
                                  onClick={() => onSetFeatured(module)}
                                >
                                  Set Featured
                                </button>
                              ) : null}
                            </>
                          ) : null}
                        </div>

                        {isEditingInline ? (
                          <AdminAdventureWeekInlineEditor
                            form={inlineForm}
                            saving={savingInline}
                            uploadingKind={uploadingInlineKind}
                            onChange={onInlineFormChange}
                            onSubmit={onSaveInlineWeek}
                            onCancel={onCancelInlineEdit}
                            onPreviewLive={() => onPreviewLive(module.id)}
                            onPreviewAdmin={() => onPreviewAdmin(module.id)}
                            onImageUpload={onInlineImageUpload}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
