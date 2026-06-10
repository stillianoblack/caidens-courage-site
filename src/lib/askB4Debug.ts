const PREFIX = '[B4_ASSISTANT]';

export function logAskB4Debug(message: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (data) {
    // eslint-disable-next-line no-console
    console.info(PREFIX, message, data);
  } else {
    // eslint-disable-next-line no-console
    console.info(PREFIX, message);
  }
}
