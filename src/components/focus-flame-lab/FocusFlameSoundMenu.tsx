import React, { useEffect, useRef } from 'react';

export type FocusFlameSoundMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (v: boolean) => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (v: boolean) => void;
  musicVolume: number;
  onMusicVolumeChange: (v: number) => void;
  sfxVolume: number;
  onSfxVolumeChange: (v: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (v: number) => void;
};

export default function FocusFlameSoundMenu({
  open,
  onOpenChange,
  soundEnabled,
  onSoundEnabledChange,
  voiceEnabled,
  onVoiceEnabledChange,
  musicVolume,
  onMusicVolumeChange,
  sfxVolume,
  onSfxVolumeChange,
  voiceVolume,
  onVoiceVolumeChange,
}: FocusFlameSoundMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onOpenChange]);

  return (
    <div className="ffl-soundMenuWrap">
      <button
        ref={triggerRef}
        type="button"
        className="ffl-soundMenuTrigger ffl-nav-button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="ffl-sound-menu-panel"
        onClick={() => onOpenChange(!open)}
      >
        Sound
      </button>
      {open ? (
        <div
          ref={panelRef}
          id="ffl-sound-menu-panel"
          className="ffl-soundMenuPanel"
          role="dialog"
          aria-label="Sound settings"
        >
          <div className="ffl-soundMenuCard">
            <div className="ffl-soundMenuTitle">Sound</div>
            <p className="ffl-soundMenuHint">Turn sounds on, then pick how loud each part feels.</p>

            <div className="ffl-soundMenuRow">
              <span className="ffl-soundMenuLabel" id="ffl-lbl-sound">
                All sounds
              </span>
              <button
                type="button"
                className={`ffl-switch ${soundEnabled ? 'ffl-switch--on' : ''}`}
                aria-labelledby="ffl-lbl-sound"
                aria-pressed={soundEnabled}
                onClick={() => onSoundEnabledChange(!soundEnabled)}
              >
                <span className="ffl-switchKnob" />
              </button>
            </div>

            <div className="ffl-soundMenuRow">
              <span className="ffl-soundMenuLabel" id="ffl-lbl-voice">
                B-4 voice
              </span>
              <button
                type="button"
                className={`ffl-switch ${voiceEnabled ? 'ffl-switch--on' : ''}`}
                aria-labelledby="ffl-lbl-voice"
                aria-pressed={voiceEnabled}
                onClick={() => onVoiceEnabledChange(!voiceEnabled)}
              >
                <span className="ffl-switchKnob" />
              </button>
            </div>
            <p className="ffl-soundMenuNote ffl-soundMenuNote--small">
              Branded narration plays when Voice is on. Nothing is sent to a live assistant.
            </p>

            <div className="ffl-soundMenuDivider" />

            <div className={`ffl-soundMenuSliderBlock ${!soundEnabled ? 'ffl-soundMenuSliderBlock--muted' : ''}`}>
              <label className="ffl-soundMenuSliderLabel" htmlFor="ffl-sfx-vol">
                UI sounds
              </label>
              <input
                id="ffl-sfx-vol"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sfxVolume}
                disabled={!soundEnabled}
                onChange={(e) => onSfxVolumeChange(Number(e.target.value))}
              />
            </div>

            <div className={`ffl-soundMenuSliderBlock ${!soundEnabled ? 'ffl-soundMenuSliderBlock--muted' : ''}`}>
              <label className="ffl-soundMenuSliderLabel" htmlFor="ffl-music-vol">
                Music
              </label>
              <input
                id="ffl-music-vol"
                type="range"
                min={0}
                max={0.3}
                step={0.01}
                value={musicVolume}
                disabled={!soundEnabled}
                onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
              />
            </div>

            <div className={`ffl-soundMenuSliderBlock ${!voiceEnabled ? 'ffl-soundMenuSliderBlock--muted' : ''}`}>
              <label className="ffl-soundMenuSliderLabel" htmlFor="ffl-voice-vol">
                B-4 voice volume
              </label>
              <input
                id="ffl-voice-vol"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={voiceVolume}
                disabled={!voiceEnabled}
                onChange={(e) => onVoiceVolumeChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
