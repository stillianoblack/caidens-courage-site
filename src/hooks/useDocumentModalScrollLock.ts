import { useEffect } from 'react';

type ScrollLockSnapshot = {
  scrollX: number;
  scrollY: number;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  htmlOverflow: string;
};

let activeLocks = 0;
let snapshot: ScrollLockSnapshot | null = null;

function lockDocumentScroll() {
  if (activeLocks === 0) {
    const body = document.body;
    const html = document.documentElement;
    snapshot = {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${snapshot.scrollY}px`;
    body.style.left = `-${snapshot.scrollX}px`;
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
  }

  activeLocks += 1;
}

function unlockDocumentScroll() {
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks !== 0 || !snapshot) return;

  const body = document.body;
  const html = document.documentElement;
  const restored = snapshot;
  snapshot = null;

  body.style.position = restored.bodyPosition;
  body.style.top = restored.bodyTop;
  body.style.left = restored.bodyLeft;
  body.style.right = restored.bodyRight;
  body.style.width = restored.bodyWidth;
  body.style.overflow = restored.bodyOverflow;
  html.style.overflow = restored.htmlOverflow;

  if (window.scrollX !== restored.scrollX || window.scrollY !== restored.scrollY) {
    window.scrollTo(restored.scrollX, restored.scrollY);
  }
}

export function useDocumentModalScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return undefined;
    lockDocumentScroll();
    return unlockDocumentScroll;
  }, [locked]);
}
