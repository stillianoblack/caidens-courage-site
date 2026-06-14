import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import AdminImageField from '../AdminImageField';
import type { AdventureModuleInput, AdventureModuleRecord, AdventureModuleStatus, WeeklyRewardType } from '../../../types/adventureModule';
import {
  archiveAdventureModule,
  createAdventureModule,
  fetchAdventureModules,
  publishAdventureModule,
  scheduleAdventureForTomorrow,
  seedDefaultAdventureModules,
  setFeaturedAdventureModule,
  updateAdventureModule,
  uploadAdventureAsset,
  type AdventureAssetUploadKind,
} from '../../../lib/adventureModuleService';
import { buildDefaultHotspotsForWeek } from '../../../lib/adventureMapMissions';
import {
  formatAdminAdventureStatus,
  isAdminListAdventure,
  isVisibleOnLiveSite,
  readAdventureVisibilityContext,
} from '../../../lib/adventureVisibility';
import {
  buildAdminPortalAdventurePreviewPath,
  buildLiveAdventurePreviewUrl,
} from '../../../lib/adventurePreviewUrls';

type AdminAdventuresTabProps = {
  onCopied?: (message: string) => void;
};

const STATUS_OPTIONS: AdventureModuleStatus[] = ['draft', 'scheduled', 'active', 'archived'];

const REWARD_TYPE_OPTIONS: WeeklyRewardType[] = ['badge', 'sticker', 'decoration', 'certificate', 'coins'];

const EMPTY_FORM: AdventureModuleInput = {
  title: '',
  subtitle: '',
  description: '',
  week_number: 1,
  status: 'draft',
  cta_text: 'Start Adventure',
  interactive_header_url: '',
  comic_thumbnail_url: '',
  map_background_url: '',
  hero_image_url: '',
  thumbnail_image_url: '',
  background_image_url: '',
  reward_value: 0,
  unlock_date: '',
  sort_order: 1,
  preview_activities: [],
  hotspots: [],
  weekly_reward_name: '',
  weekly_reward_type: 'badge',
  weekly_reward_svg_url: '',
  weekly_reward_image_url: '',
  weekly_reward_description: '',
  weekly_reward_rarity: '',
  weekly_reward_coin_value: 0,
  coloring_page_pdf_url: '',
  weekly_module_pdf_url: '',
  comic_pdf_url: '',
  certificate_pdf_or_image_url: '',
  facilitator_kit_pdf_url: '',
  is_live: false,
  is_admin_preview: false,
};

function moduleToForm(module: AdventureModuleRecord): AdventureModuleInput {
  return {
    title: module.title,
    subtitle: module.subtitle ?? '',
    description: module.description ?? '',
    week_number: module.week_number,
    status: module.status,
    cta_text: module.cta_text ?? '',
    interactive_header_url: '',
    comic_thumbnail_url: module.comic_thumbnail_url ?? module.thumbnail_image_url ?? '',
    map_background_url: module.map_background_url ?? module.background_image_url ?? '',
    hero_image_url: '',
    thumbnail_image_url: module.comic_thumbnail_url ?? module.thumbnail_image_url ?? '',
    background_image_url: module.map_background_url ?? module.background_image_url ?? '',
    reward_value: module.reward_value,
    unlock_date: module.unlock_date ?? '',
    sort_order: module.sort_order,
    preview_activities: module.preview_activities ?? [],
    hotspots: module.hotspots ?? [],
    weekly_reward_name: module.weekly_reward_name ?? '',
    weekly_reward_type: module.weekly_reward_type ?? 'badge',
    weekly_reward_svg_url: module.weekly_reward_svg_url ?? '',
    weekly_reward_image_url: module.weekly_reward_image_url ?? '',
    weekly_reward_description: module.weekly_reward_description ?? '',
    weekly_reward_rarity: module.weekly_reward_rarity ?? '',
    weekly_reward_coin_value: module.weekly_reward_coin_value ?? 0,
    coloring_page_pdf_url: module.coloring_page_pdf_url ?? '',
    weekly_module_pdf_url: module.weekly_module_pdf_url ?? '',
    comic_pdf_url: module.comic_pdf_url ?? '',
    certificate_pdf_or_image_url: module.certificate_pdf_or_image_url ?? '',
    facilitator_kit_pdf_url: module.facilitator_kit_pdf_url ?? '',
    is_live: module.is_live ?? false,
    is_admin_preview: module.is_admin_preview ?? false,
  };
}

function formatUnlockDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminAdventuresTab({ onCopied }: AdminAdventuresTabProps) {
  const [modules, setModules] = useState<AdventureModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdventureModuleInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<AdventureAssetUploadKind | null>(null);
  const liveCtx = useMemo(() => readAdventureVisibilityContext(null, ''), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdventureModules();
    setModules(result.modules);
    setError(result.error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleModules = useMemo(
    () => modules.filter(isAdminListAdventure),
    [modules],
  );

  const openPreviewAdmin = (id: string) => {
    window.open(buildAdminPortalAdventurePreviewPath(id, 'admin'), '_blank', 'noopener,noreferrer');
  };

  const openPreviewLive = (id: string) => {
    window.open(buildLiveAdventurePreviewUrl(id), '_blank', 'noopener,noreferrer');
  };

  const openMapPreview = () => {
    if (editingId) {
      openPreviewAdmin(editingId);
      return;
    }
    onCopied?.('Save the adventure first, then preview the map.');
  };

  const editingModule = useMemo(
    () => modules.find((row) => row.id === editingId) ?? null,
    [editingId, modules],
  );

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, week_number: 2, sort_order: modules.length + 1 });
  };

  const startEdit = (module: AdventureModuleRecord) => {
    setEditingId(module.id);
    setForm(moduleToForm(module));
  };

  const handleImportDefaults = async () => {
    setSeeding(true);
    setError(null);
    const result = await seedDefaultAdventureModules();
    setSeeding(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.(`Imported ${result.count} default adventures.`);
    await refresh();
  };

  const loadDefaultHotspots = () => {
    const hotspots = buildDefaultHotspotsForWeek(
      form.week_number,
      {
        kidsBasePath: '/family-hub/kids',
        downloadsPath: '/family-hub/downloads',
        certificatesPath: '/family-hub/certificates',
      },
      form.title || `Week ${form.week_number}`,
    );
    setForm((prev) => ({ ...prev, hotspots }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: AdventureModuleInput = {
      ...form,
      unlock_date: form.unlock_date || null,
    };

    const result = editingId
      ? await updateAdventureModule(editingId, payload)
      : await createAdventureModule(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCopied?.('Adventure saved.');
    if (result.module) {
      setEditingId(result.module.id);
      setForm(moduleToForm(result.module));
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    await refresh();
  };

  const handleArchive = async (id: string) => {
    const result = await archiveAdventureModule(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.('Adventure archived.');
    await refresh();
  };

  const handlePublish = async (id: string) => {
    const result = await publishAdventureModule(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.('Adventure published — other weeks stay available.');
    await refresh();
  };

  const handleSetFeatured = async (id: string) => {
    const result = await setFeaturedAdventureModule(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.('Adventure set as featured hero week.');
    await refresh();
  };

  const handleScheduleTomorrow = async (id: string) => {
    const result = await scheduleAdventureForTomorrow(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.('Adventure scheduled for tomorrow.');
    await refresh();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: AdventureAssetUploadKind,
    field?: keyof AdventureModuleInput,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    setError(null);

    const buildPatch = (url: string): Partial<AdventureModuleInput> => {
      if (field) return { [field]: url };
      if (kind === 'comic_thumbnail' || kind === 'thumbnail') {
        return {
          comic_thumbnail_url: url,
          thumbnail_image_url: url,
          thumbnail_url: url,
        };
      }
      if (kind === 'map_background' || kind === 'background' || kind === 'hero' || kind === 'interactive_header') {
        return { map_background_url: url };
      }
      return {};
    };

    const localPreview = URL.createObjectURL(file);
    const previewPatch = buildPatch(localPreview);
    setForm((prev) => ({ ...prev, ...previewPatch }));

    const adventureId = editingId ?? 'new';

    try {
      const result = await uploadAdventureAsset(file, adventureId, kind);
      event.target.value = '';

      if (result.error) {
        const bucketHelp =
          result.error.toLowerCase().includes('bucket not found')
            ? ' Run supabase/adventures_storage_bucket_setup.sql in the Supabase SQL Editor to create the adventure-assets bucket.'
            : '';
        setError(`${result.error}${bucketHelp}`);
        onCopied?.(`Upload failed: ${result.error}`);
        setForm((prev) => {
          const next = { ...prev };
          if ('map_background_url' in previewPatch) next.map_background_url = '';
          if ('comic_thumbnail_url' in previewPatch) {
            next.comic_thumbnail_url = '';
            next.thumbnail_image_url = '';
            next.thumbnail_url = '';
          }
          return next;
        });
        return;
      }

      const url = result.url ?? '';
      if (!url) {
        setError('Upload succeeded but no public URL was returned.');
        return;
      }

      const patch = buildPatch(url);
      setForm((prev) => ({ ...prev, ...patch }));

      if (editingId && url) {
        const saveResult = await updateAdventureModule(editingId, patch);
        if (saveResult.error) {
          setError(`Image uploaded to storage but database update failed: ${saveResult.error}`);
          onCopied?.('Warning: Image uploaded but database update failed.');
          return;
        }
        if (saveResult.module) {
          setForm((prev) => ({
            ...moduleToForm(saveResult.module!),
            ...patch,
            map_background_url:
              saveResult.module!.map_background_url?.trim() ||
              patch.map_background_url ||
              prev.map_background_url,
            comic_thumbnail_url:
              saveResult.module!.comic_thumbnail_url?.trim() ||
              patch.comic_thumbnail_url ||
              prev.comic_thumbnail_url,
          }));
        }
        await refresh();
        onCopied?.('Adventure images updated.');
        return;
      }

      onCopied?.('Image uploaded. Save the adventure to persist for new records.');
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingKind(null);
    }
  };

  return (
    <SettingsCard
      title="Adventures"
      subtitle="Create and manage weekly adventure modules without code changes."
    >
      <div className="adminAdventuresToolbar">
        <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={startCreate}>
          Create Adventure
        </button>
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--ghost"
          disabled={seeding}
          onClick={() => void handleImportDefaults()}
        >
          {seeding ? 'Importing…' : 'Import Default Weeks'}
        </button>
      </div>

      {loading ? <p className="adminPortal-empty">Loading adventures…</p> : null}
      {error ? <p className="adminPortal-error">{error}</p> : null}

      <div className="adminAdventuresTableWrap">
        <table className="adminAdventuresTable">
          <thead>
            <tr>
              <th scope="col">Preview</th>
              <th scope="col">Week</th>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Unlock Date</th>
              <th scope="col">Live Site</th>
              <th scope="col">Sort</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleModules.map((module) => (
              <tr key={module.id}>
                <td>
                  {module.thumbnail_image_url ? (
                    <img
                      src={module.thumbnail_image_url}
                      alt=""
                      className="adminAdventureThumb"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="adminAdventureThumb adminAdventureThumb--placeholder" aria-hidden="true">
                      🗺️
                    </span>
                  )}
                </td>
                <td>{module.week_number}</td>
                <td>
                  <strong>{module.title}</strong>
                  {module.subtitle ? <span className="adminAdventureTableSub">{module.subtitle}</span> : null}
                </td>
                <td>
                  <div className="adminAdventureStatusRow">
                    <span className={`adminAdventureStatus adminAdventureStatus--${module.status}`}>
                      {formatAdminAdventureStatus(module.status)}
                    </span>
                    {module.is_featured ? (
                      <span className="adminAdventureFeaturedBadge">Featured</span>
                    ) : null}
                  </div>
                </td>
                <td>{formatUnlockDate(module.unlock_date)}</td>
                <td>{isVisibleOnLiveSite(module, liveCtx) ? 'Yes' : 'No'}</td>
                <td>{module.sort_order}</td>
                <td>
                  <div className="adminAdventureActions">
                    <button
                      type="button"
                      className="adminPortal-btn adminPortal-btn--ghost"
                      onClick={() => openPreviewLive(module.id)}
                    >
                      Preview Live
                    </button>
                    <button
                      type="button"
                      className="adminPortal-btn adminPortal-btn--ghost"
                      onClick={() => openPreviewAdmin(module.id)}
                    >
                      Preview as Admin
                    </button>
                    <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => startEdit(module)}>
                      Edit
                    </button>
                    {module.status !== 'active' ? (
                      <button
                        type="button"
                        className="adminPortal-btn adminPortal-btn--ghost"
                        onClick={() => void handlePublish(module.id)}
                      >
                        Publish
                      </button>
                    ) : (
                      <span className="adminAdventurePublishedBadge">Published</span>
                    )}
                    {!module.is_featured ? (
                      <button
                        type="button"
                        className="adminPortal-btn adminPortal-btn--ghost"
                        onClick={() => void handleSetFeatured(module.id)}
                      >
                        Set as Featured
                      </button>
                    ) : (
                      <span className="adminAdventureFeaturedBadge">Featured Hero</span>
                    )}
                    {module.status !== 'scheduled' && module.status !== 'active' ? (
                      <button
                        type="button"
                        className="adminPortal-btn adminPortal-btn--ghost"
                        onClick={() => void handleScheduleTomorrow(module.id)}
                      >
                        Schedule
                      </button>
                    ) : null}
                    {module.status !== 'archived' ? (
                      <button
                        type="button"
                        className="adminPortal-btn adminPortal-btn--ghost"
                        onClick={() => void handleArchive(module.id)}
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="adminAdventureForm" onSubmit={(event) => void handleSave(event)}>
        <h4 className="adminAdventureFormTitle">
          {editingModule ? 'Edit Adventure' : 'New Adventure'}
        </h4>

        <div className="adminAdventureFormGrid">
          <label className="adminPortal-field">
            <span>Week Number</span>
            <input
              type="number"
              min={1}
              value={form.week_number}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, week_number: Number(event.target.value) || 1 }))
              }
              required
            />
          </label>
          <label className="adminPortal-field">
            <span>Sort Order</span>
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) || 0 }))
              }
            />
          </label>
          <label className="adminPortal-field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as AdventureModuleStatus }))
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="adminPortal-field">
            <span>Reward Value</span>
            <input
              type="number"
              min={0}
              value={form.reward_value ?? 0}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reward_value: Number(event.target.value) || 0 }))
              }
            />
          </label>
        </div>

        <label className="adminPortal-field">
          <span>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </label>
        <label className="adminPortal-field">
          <span>Subtitle</span>
          <input
            type="text"
            value={form.subtitle ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
          />
        </label>
        <label className="adminPortal-field">
          <span>Description</span>
          <textarea
            rows={3}
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
        <label className="adminPortal-field">
          <span>CTA Text</span>
          <input
            type="text"
            value={form.cta_text ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, cta_text: event.target.value }))}
          />
        </label>
        <label className="adminPortal-field">
          <span>Unlock Date</span>
          <input
            type="datetime-local"
            value={form.unlock_date ? form.unlock_date.slice(0, 16) : ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                unlock_date: event.target.value ? new Date(event.target.value).toISOString() : '',
              }))
            }
          />
        </label>

        <div className="adminAdventureFormGrid">
          <label className="adminPortal-field adminPortal-field--checkbox">
            <input
              type="checkbox"
              checked={Boolean(form.is_live)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, is_live: event.target.checked }))
              }
            />
            <span>Live on family site (override unlock)</span>
          </label>
          <label className="adminPortal-field adminPortal-field--checkbox">
            <input
              type="checkbox"
              checked={Boolean(form.is_admin_preview)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, is_admin_preview: event.target.checked }))
              }
            />
            <span>Admin preview only (hidden from families)</span>
          </label>
        </div>

        <label className="adminPortal-field">
          <span>Preview Activities (one per line)</span>
          <textarea
            rows={4}
            value={(form.preview_activities ?? []).join('\n')}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                preview_activities: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>

        <div className="adminAdventureFormSection">
          <h5 className="adminAdventureFormSectionTitle">Weekly Completion Reward</h5>
          <div className="adminAdventureFormGrid">
            <label className="adminPortal-field">
              <span>Reward Name</span>
              <input
                type="text"
                value={form.weekly_reward_name ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, weekly_reward_name: event.target.value }))
                }
              />
            </label>
            <label className="adminPortal-field">
              <span>Reward Type</span>
              <select
                value={form.weekly_reward_type ?? 'badge'}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    weekly_reward_type: event.target.value as WeeklyRewardType,
                  }))
                }
              >
                {REWARD_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="adminPortal-field">
              <span>Rarity</span>
              <input
                type="text"
                value={form.weekly_reward_rarity ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, weekly_reward_rarity: event.target.value }))
                }
              />
            </label>
            <label className="adminPortal-field">
              <span>Coin Value</span>
              <input
                type="number"
                min={0}
                value={form.weekly_reward_coin_value ?? 0}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    weekly_reward_coin_value: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>
          </div>
          <label className="adminPortal-field">
            <span>Reward Description</span>
            <textarea
              rows={2}
              value={form.weekly_reward_description ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, weekly_reward_description: event.target.value }))
              }
            />
          </label>
          <div className="adminAdventureFormGrid">
            <label className="adminPortal-field">
              <span>Reward SVG URL</span>
              <input
                type="url"
                value={form.weekly_reward_svg_url ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, weekly_reward_svg_url: event.target.value }))
                }
              />
              <input
                type="file"
                accept="image/svg+xml,.svg"
                onChange={(event) =>
                  void handleImageUpload(event, 'weekly_reward_svg', 'weekly_reward_svg_url')
                }
              />
            </label>
            <label className="adminPortal-field">
              <span>Reward Image URL</span>
              <input
                type="url"
                value={form.weekly_reward_image_url ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, weekly_reward_image_url: event.target.value }))
                }
              />
              <input
                type="file"
                accept="image/*,.webp,.png,.jpg,.jpeg"
                onChange={(event) =>
                  void handleImageUpload(event, 'weekly_reward_image', 'weekly_reward_image_url')
                }
              />
            </label>
          </div>
        </div>

        <div className="adminAdventureFormSection">
          <h5 className="adminAdventureFormSectionTitle">Downloadable Assets</h5>
          {(
            [
              ['coloring_page_pdf_url', 'Coloring Page PDF', 'coloring_page_pdf'],
              ['weekly_module_pdf_url', 'Weekly Module PDF', 'weekly_module_pdf'],
              ['comic_pdf_url', 'Comic PDF', 'comic_pdf'],
              ['certificate_pdf_or_image_url', 'Certificate PDF/Image', 'certificate_pdf'],
              ['facilitator_kit_pdf_url', 'Facilitator Kit PDF', 'facilitator_kit_pdf'],
            ] as const
          ).map(([field, label, uploadKind]) => (
            <label key={field} className="adminPortal-field">
              <span>{label}</span>
              <input
                type="url"
                value={String(form[field] ?? '')}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [field]: event.target.value }))
                }
              />
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(event) =>
                  void handleImageUpload(event, uploadKind, field)
                }
              />
            </label>
          ))}
        </div>

        <div className="adminAdventureSpotEditor">
          <div className="adminAdventureSpotEditorHead">
            <h5>Interactive Map Spots</h5>
            <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={loadDefaultHotspots}>
              Load Default Spots
            </button>
          </div>
          {(form.hotspots ?? []).map((spot, index) => (
            <div key={`${spot.character_key}-${index}`} className="adminAdventureSpotRow">
              <label className="adminPortal-field">
                <span>Character</span>
                <select
                  value={spot.character_key}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, character_key: event.target.value as typeof spot.character_key }
                          : row,
                      ),
                    }))
                  }
                >
                  {['caiden', 'miranda', 'zeke', 'charlie', 'b4'].map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </label>
              <label className="adminPortal-field">
                <span>Label</span>
                <input
                  type="text"
                  value={spot.label_text}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                        rowIndex === index ? { ...row, label_text: event.target.value } : row,
                      ),
                    }))
                  }
                />
              </label>
              <label className="adminPortal-field">
                <span>Mission Title</span>
                <input
                  type="text"
                  value={spot.mission_title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                        rowIndex === index ? { ...row, mission_title: event.target.value } : row,
                      ),
                    }))
                  }
                />
              </label>
              <label className="adminPortal-field">
                <span>Route Slug</span>
                <input
                  type="text"
                  value={spot.route_slug ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                        rowIndex === index ? { ...row, route_slug: event.target.value } : row,
                      ),
                    }))
                  }
                />
              </label>
              <label className="adminPortal-field">
                <span>Status</span>
                <select
                  value={spot.status ?? 'available'}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, status: event.target.value as typeof spot.status }
                          : row,
                      ),
                    }))
                  }
                >
                  {['available', 'locked', 'complete'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="adminPortal-field">
                <span>Position X / Y (%)</span>
                <div className="adminAdventureSpotCoords">
                  <input
                    type="number"
                    value={spot.position_x ?? 50}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, position_x: Number(event.target.value) || 0 }
                            : row,
                        ),
                      }))
                    }
                  />
                  <input
                    type="number"
                    value={spot.position_y ?? 50}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hotspots: (prev.hotspots ?? []).map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, position_y: Number(event.target.value) || 0 }
                            : row,
                        ),
                      }))
                    }
                  />
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="adminAdventureUploadRow">
          <AdminImageField
            label="Adventure Map / Hero Background"
            value={form.map_background_url ?? form.background_image_url ?? ''}
            uploading={uploadingKind === 'map_background'}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                map_background_url: value,
              }))
            }
            onUpload={(event) => void handleImageUpload(event, 'map_background')}
            examplePaths={['/images/caidenscourage/Game-Hub/courage-in-the-dark.webp']}
            previewLabel="Adventure map preview"
          />
          <AdminImageField
            label="Comic Thumbnail"
            value={form.comic_thumbnail_url ?? form.thumbnail_image_url ?? ''}
            uploading={uploadingKind === 'comic_thumbnail'}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                comic_thumbnail_url: value,
                thumbnail_image_url: value,
                thumbnail_url: value,
              }))
            }
            onUpload={(event) => void handleImageUpload(event, 'comic_thumbnail')}
            examplePaths={['/images/caidenscourage/Game-Hub/courage-in-the-dark.webp']}
            previewLabel="Comic thumbnail preview"
          />
        </div>

        {form.map_background_url ? (
          <div className="adminAdventureUploadPreview">
            <img
              src={form.map_background_url}
              alt=""
              className="adminAdventurePreviewArt adminAdventurePreviewArt--map"
              loading="lazy"
              decoding="async"
            />
            <p className="adminAdventureUploadPreviewLabel">Saved map background preview</p>
          </div>
        ) : null}

        {form.comic_thumbnail_url ? (
          <div className="adminAdventureUploadPreview">
            <img
              src={form.comic_thumbnail_url}
              alt=""
              className="adminAdventurePreviewArt adminAdventurePreviewArt--thumb"
              loading="lazy"
              decoding="async"
            />
            <p className="adminAdventureUploadPreviewLabel">Saved comic thumbnail preview</p>
          </div>
        ) : null}

        {form.map_background_url ? (
          <div className="adminAdventureMapPreviewActions">
            <button
              type="button"
              className="adminPortal-btn adminPortal-btn--ghost"
              onClick={openMapPreview}
            >
              Preview Map
            </button>
          </div>
        ) : null}

        {form.comic_thumbnail_url || form.map_background_url ? (
          <div className="adminAdventurePreviewCard">
            {form.comic_thumbnail_url || form.thumbnail_image_url ? (
              <img
                src={form.comic_thumbnail_url || form.thumbnail_image_url || ''}
                alt=""
                className="adminAdventurePreviewArt"
                loading="lazy"
                decoding="async"
              />
            ) : null}
            <div>
              <p className="adminAdventurePreviewTitle">{form.title || 'Adventure title'}</p>
              <p className="adminAdventurePreviewSub">{form.subtitle || 'Subtitle preview'}</p>
              <p className="adminAdventurePreviewDesc">{form.description || 'Description preview'}</p>
              <span className="adminAdventurePreviewCta">{form.cta_text || 'Start Adventure'}</span>
            </div>
          </div>
        ) : null}

        <button type="submit" className="adminPortal-btn adminPortal-btn--primary" disabled={saving}>
          {saving ? 'Saving…' : editingId ? 'Update Adventure' : 'Create Adventure'}
        </button>
      </form>
    </SettingsCard>
  );
}
