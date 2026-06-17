import React from 'react';
import AdminImageField from './AdminImageField';
import type { AdventureModuleInput, AdventureModuleStatus } from '../../types/adventureModule';
import type { AdventureAssetUploadKind } from '../../lib/adventureModuleService';
import {
  ADMIN_ADVENTURE_STATUS_OPTIONS,
  ADMIN_WEEKLY_REWARD_TYPE_OPTIONS,
} from '../../lib/adminAdventureFormShared';
import { resolveDefaultMonthNumber } from '../../lib/adventureMonthService';

type AdminAdventureWeekInlineEditorProps = {
  form: AdventureModuleInput;
  saving: boolean;
  uploadingKind: AdventureAssetUploadKind | null;
  onChange: (patch: Partial<AdventureModuleInput>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  onPreviewLive: () => void;
  onPreviewAdmin: () => void;
  onImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: AdventureAssetUploadKind,
    field?: keyof AdventureModuleInput,
  ) => void;
};

const PDF_ASSET_FIELDS = [
  ['coloring_page_pdf_url', 'Coloring Page PDF', 'coloring_page_pdf'],
  ['weekly_module_pdf_url', 'Weekly Module PDF', 'weekly_module_pdf'],
  ['comic_pdf_url', 'Comic PDF', 'comic_pdf'],
  ['certificate_pdf_or_image_url', 'Certificate PDF/Image', 'certificate_pdf'],
  ['facilitator_kit_pdf_url', 'Facilitator Kit PDF', 'facilitator_kit_pdf'],
] as const;

export default function AdminAdventureWeekInlineEditor({
  form,
  saving,
  uploadingKind,
  onChange,
  onSubmit,
  onCancel,
  onPreviewLive,
  onPreviewAdmin,
  onImageUpload,
}: AdminAdventureWeekInlineEditorProps) {
  return (
    <form className="adminAdventureWeekInlineEditor" onSubmit={onSubmit}>
      <div className="adminAdventureFormGrid">
        <label className="adminPortal-field">
          <span>Week number</span>
          <input
            type="number"
            min={1}
            value={form.week_number}
            onChange={(event) => {
              const weekNumber = Number(event.target.value) || 1;
              onChange({
                week_number: weekNumber,
                month_number: form.month_number ?? resolveDefaultMonthNumber(weekNumber),
              });
            }}
            required
          />
        </label>
        <label className="adminPortal-field">
          <span>Month number</span>
          <input
            type="number"
            min={1}
            value={form.month_number ?? resolveDefaultMonthNumber(form.week_number)}
            onChange={(event) =>
              onChange({
                month_number:
                  Number(event.target.value) || resolveDefaultMonthNumber(form.week_number),
              })
            }
          />
        </label>
        <label className="adminPortal-field">
          <span>Sort order</span>
          <input
            type="number"
            value={form.sort_order ?? 0}
            onChange={(event) =>
              onChange({ sort_order: Number(event.target.value) || 0 })
            }
          />
        </label>
        <label className="adminPortal-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) =>
              onChange({ status: event.target.value as AdventureModuleStatus })
            }
          >
            {ADMIN_ADVENTURE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="adminPortal-field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => onChange({ title: event.target.value })}
          required
        />
      </label>
      <label className="adminPortal-field">
        <span>SEL focus (subtitle)</span>
        <input
          type="text"
          value={form.subtitle ?? ''}
          onChange={(event) => onChange({ subtitle: event.target.value })}
        />
      </label>

      <label className="adminPortal-field">
        <span>Unlock date</span>
        <input
          type="datetime-local"
          value={form.unlock_date ? form.unlock_date.slice(0, 16) : ''}
          onChange={(event) =>
            onChange({
              unlock_date: event.target.value ? new Date(event.target.value).toISOString() : '',
            })
          }
        />
      </label>

      <div className="adminAdventureFormGrid">
        <label className="adminPortal-field adminPortal-field--checkbox">
          <input
            type="checkbox"
            checked={Boolean(form.is_live)}
            onChange={(event) => onChange({ is_live: event.target.checked })}
          />
          <span>Published / live on family site</span>
        </label>
        <label className="adminPortal-field adminPortal-field--checkbox">
          <input
            type="checkbox"
            checked={Boolean(form.is_admin_preview)}
            onChange={(event) => onChange({ is_admin_preview: event.target.checked })}
          />
          <span>Admin preview only</span>
        </label>
      </div>

      <div className="adminAdventureUploadRow">
        <AdminImageField
          label="Adventure map / hero fallback"
          value={form.map_background_url ?? ''}
          uploading={uploadingKind === 'map_background'}
          onChange={(value) => onChange({ map_background_url: value })}
          onUpload={(event) => onImageUpload(event, 'map_background')}
          examplePaths={['/images/caidenscourage/Game-Hub/courage-in-the-dark.webp']}
          previewLabel="Map background"
        />
        <AdminImageField
          label="Comic thumbnail"
          value={form.comic_thumbnail_url ?? form.thumbnail_image_url ?? ''}
          uploading={uploadingKind === 'comic_thumbnail'}
          onChange={(value) =>
            onChange({
              comic_thumbnail_url: value,
              thumbnail_image_url: value,
              thumbnail_url: value,
            })
          }
          onUpload={(event) => onImageUpload(event, 'comic_thumbnail')}
          previewLabel="Comic thumbnail"
        />
      </div>

      <div className="adminAdventureFormSection">
        <h5 className="adminAdventureFormSectionTitle">Weekly reward</h5>
        <div className="adminAdventureFormGrid">
          <label className="adminPortal-field">
            <span>Reward name</span>
            <input
              type="text"
              value={form.weekly_reward_name ?? ''}
              onChange={(event) => onChange({ weekly_reward_name: event.target.value })}
            />
          </label>
          <label className="adminPortal-field">
            <span>Reward type</span>
            <select
              value={form.weekly_reward_type ?? 'badge'}
              onChange={(event) =>
                onChange({
                  weekly_reward_type: event.target.value as AdventureModuleInput['weekly_reward_type'],
                })
              }
            >
              {ADMIN_WEEKLY_REWARD_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="adminPortal-field">
            <span>Coin value</span>
            <input
              type="number"
              min={0}
              value={form.weekly_reward_coin_value ?? 0}
              onChange={(event) =>
                onChange({ weekly_reward_coin_value: Number(event.target.value) || 0 })
              }
            />
          </label>
        </div>
        <div className="adminAdventureFormGrid">
          <label className="adminPortal-field">
            <span>Reward SVG URL</span>
            <input
              type="url"
              value={form.weekly_reward_svg_url ?? ''}
              onChange={(event) => onChange({ weekly_reward_svg_url: event.target.value })}
            />
            <input
              type="file"
              accept="image/svg+xml,.svg"
              onChange={(event) => onImageUpload(event, 'weekly_reward_svg', 'weekly_reward_svg_url')}
            />
          </label>
          <label className="adminPortal-field">
            <span>Reward image URL</span>
            <input
              type="url"
              value={form.weekly_reward_image_url ?? ''}
              onChange={(event) => onChange({ weekly_reward_image_url: event.target.value })}
            />
            <input
              type="file"
              accept="image/*,.webp,.png,.jpg,.jpeg"
              onChange={(event) =>
                onImageUpload(event, 'weekly_reward_image', 'weekly_reward_image_url')
              }
            />
          </label>
        </div>
      </div>

      <div className="adminAdventureFormSection">
        <h5 className="adminAdventureFormSectionTitle">Downloadable assets</h5>
        {PDF_ASSET_FIELDS.map(([field, label, uploadKind]) => (
          <label key={field} className="adminPortal-field">
            <span>{label}</span>
            <input
              type="url"
              value={String(form[field] ?? '')}
              onChange={(event) => onChange({ [field]: event.target.value })}
            />
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => onImageUpload(event, uploadKind, field)}
            />
          </label>
        ))}
      </div>

      <div className="adminAdventureFormActions adminAdventureWeekInlineEditorActions">
        <button type="submit" className="adminPortal-btn adminPortal-btn--primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Week'}
        </button>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onPreviewLive}>
          Preview Live
        </button>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onPreviewAdmin}>
          Preview as Admin
        </button>
      </div>
    </form>
  );
}
