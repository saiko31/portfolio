let failureUntil = 0;

export function simulateFailure(durationSeconds: number = 30): void {
  failureUntil = Date.now() + durationSeconds * 1000;
}

export function isFailing(): boolean {
  return Date.now() < failureUntil;
}

export function resetFailure(): void {
  failureUntil = 0;
}

export function getFailureRemainingSeconds(): number {
  return Math.max(0, Math.ceil((failureUntil - Date.now()) / 1000));
}
