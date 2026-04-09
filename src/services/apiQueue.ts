// ── Twelve Data global rate-limit queue ──────────────────────────────────────
// All Twelve Data API calls (useLivePrices + signalEngine) funnel through here.
// Free tier: 8 credits/minute. We process at max 6/min (10s gap) to stay safe.

const GAP_MS = 10_000; // one call every 10s → 6/min, safely under 8/min cap

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Task<T = any> {
  fn: () => Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queue: Task<any>[] = [];
let lastFiredAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

const tick = () => {
  timer = null;
  if (queue.length === 0) return;

  const wait = Math.max(0, GAP_MS - (Date.now() - lastFiredAt));
  if (wait > 0) {
    timer = setTimeout(tick, wait);
    return;
  }

  const task = queue.shift()!;
  lastFiredAt = Date.now();
  task.fn().then(task.resolve, task.reject).finally(() => {
    if (queue.length > 0) timer = setTimeout(tick, GAP_MS);
  });
};

/** Enqueue an API call. Returns a Promise that resolves when the call completes. */
export const enqueueApiCall = <T>(fn: () => Promise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    if (!timer) tick();
  });
