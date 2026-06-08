export async function copyToClipboard(
  value: string,
  label = 'Copied',
  onCopied?: (message: string) => void,
): Promise<boolean> {
  const text = value.trim();
  if (!text) return false;

  let success = false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      success = true;
    }
  } catch {
    /* fall through to legacy copy */
  }

  if (!success) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      success = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      success = false;
    }
  }

  if (success) {
    onCopied?.(label);
  }

  return success;
}
