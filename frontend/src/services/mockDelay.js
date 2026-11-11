export function mockDelay(milliseconds = 350, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Cancelled", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    function abort() {
      clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    }
    signal?.addEventListener("abort", abort, { once: true });
  });
}
