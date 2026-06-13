import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import AdminImageField from '../AdminImageField';
import type { AdventureModuleInput, AdventureModuleRecord, AdventureModuleStatus } from '../../../types/adventureModule';
import {
  archiveAdventureModule,
  createAdventureModule,
  fetchAdventureModules,
  setActiveAdventureModule,
  updateAdventureModule,
  uploadAdventureAsset,
} from '../../../lib/adventureModuleService';
import {
  isAdminListAdventure,
  ADMIN_PREVIEW_PARAM,
  PREVIEW_ADVENTURE_PARAM,
} from '../../../lib/adventureVisibility';
import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH } from '../../../config/courageRoutes';

type AdminAdventuresTabProps = {
  onCopied?: (message: string) => void;
};

const STATUS_OPTIONS: AdventureModuleStatus[] = ['draft', 'scheduled', 'active', 'archived'];

const EMPTY_FORM: AdventureModuleInput = {
  title: '',
  subtitle: '',
  description: '',
  week_number: 1,
  status: 'draft',
  cta_text: 'Start Adventure',
  hero_image_url: '',
  thumbnail_image_url: '',
  background_image_url: '',
  reward_value: 0,
  unlock_date: '',
  sort_order: 1,
};

export default function AdminAdventuresTab({ onCopied }: AdminAdventuresTabProps) {
  const [modules, setModules] = useState<AdventureModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdventureModuleInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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

  const openPreviewLive = (id: string) => {
    const params = new URLSearchParams();
    params.set(PREVIEW_ADVENTURE_PARAM, id);
    params.set(ADMIN_PREVIEW_PARAM, 'true');
    const url = `${FAMILY_PORTAL_PATH}/weekly-adventures?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openMapPreview = () => {
    if (editingId) {
      openPreviewLive(editingId);
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
    setForm({ ...EMPTY_FORM, sort_order: modules.length + 1 });
  };

  const startEdit = (module: AdventureModuleRecord) => {
    setEditingId(module.id);
    setForm({
      title: module.title,
      subtitle: module.subtitle ?? '',
      description: module.description ?? '',
      week_number: module.week_number,
      status: module.status,
      cta_text: module.cta_text ?? '',
      hero_image_url: module.hero_image_url ?? '',
      thumbnail_image_url: module.thumbnail_image_url ?? '',
      background_image_url: module.background_image_url ?? '',
      reward_value: module.reward_value,
      unlock_date: module.unlock_date ?? '',
      sort_order: module.sort_order,
    });
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
    setEditingId(null);
    setForm(EMPTY_FORM);
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

  const handleSetActive = async (id: string) => {
    const result = await setActiveAdventureModule(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    onCopied?.('Adventure marked active.');
    await refresh();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'hero' | 'thumbnail' | 'background',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const adventureId = editingId ?? 'new';
    const result = await uploadAdventureAsset(file, adventureId, kind);
    if (result.error) {
      setError(result.error);
      return;
    }

    if (kind === 'hero') setForm((prev) => ({ ...prev, hero_image_url: result.url ?? '' }));
    if (kind === 'thumbnail') setForm((prev) => ({ ...prev, thumbnail_image_url: result.url ?? '' }));
    if (kind === 'background') setForm((prev) => ({ ...prev, background_image_url: result.url ?? '' }));
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
      </div>

      {loading ? <p className="adminPortal-empty">Loading adventures…</p> : null}
      {error ? <p className="adminPortal-error">{error}</p> : null}

      <div className="adminAdventuresList">
        {visibleModules.map((module) => (
          <article key={module.id} className="adminAdventureRow">
            <div className="adminAdventureRowMain">
              {module.thumbnail_image_url ? (
                <img src={module.thumbnail_image_url} alt="" className="adminAdventureThumb" />
              ) : (
                <span className="adminAdventureThumb adminAdventureThumb--placeholder" aria-hidden="true">
                  🗺️
                </span>
              )}
              <div>
                <h4 className="adminAdventureTitle">
                  Week {module.week_number}: {module.title}
                </h4>
                <p className="adminAdventureMeta">
                  {module.status} · sort {module.sort_order}
                  {module.subtitle ? ` · ${module.subtitle}` : ''}
                </p>
              </div>
            </div>
            <div className="adminAdventureActions">
              <button
                type="button"
                className="adminPortal-btn adminPortal-btn--ghost"
                onClick={() => openPreviewLive(module.id)}
              >
                Preview Live
              </button>
              <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => startEdit(module)}>
                Edit
              </button>
              {module.status !== 'active' ? (
                <button
                  type="button"
                  className="adminPortal-btn adminPortal-btn--ghost"
                  onClick={() => void handleSetActive(module.id)}
                >
                  Mark Active
                </button>
              ) : (
                <span className="adminAdventureActiveBadge">Current</span>
              )}
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
          </article>
        ))}
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

        <div className="adminAdventureUploadRow">
          <AdminImageField
            label="Hero Image"
            value={form.hero_image_url ?? ''}
            onChange={(value) => setForm((prev) => ({ ...prev, hero_image_url: value }))}
            onUpload={(event) => void handleImageUpload(event, 'hero')}
            examplePaths={['/images/week1-hero.webp']}
            previewLabel="Hero preview"
          />
          <AdminImageField
            label="Thumbnail"
            value={form.thumbnail_image_url ?? ''}
            onChange={(value) => setForm((prev) => ({ ...prev, thumbnail_image_url: value }))}
            onUpload={(event) => void handleImageUpload(event, 'thumbnail')}
            examplePaths={['/images/caidenscourage/Game-Hub/courage-in-the-dark.webp']}
            previewLabel="Thumbnail preview"
          />
          <AdminImageField
            label="Background"
            value={form.background_image_url ?? ''}
            onChange={(value) => setForm((prev) => ({ ...prev, background_image_url: value }))}
            onUpload={(event) => void handleImageUpload(event, 'background')}
            examplePaths={['/images/week1-map.webp', '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp']}
            previewLabel="Map background preview"
          />
        </div>

        {form.background_image_url ? (
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

        {form.thumbnail_image_url || form.hero_image_url ? (
          <div className="adminAdventurePreviewCard">
            {form.thumbnail_image_url ? (
              <img src={form.thumbnail_image_url} alt="" className="adminAdventurePreviewArt" />
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
