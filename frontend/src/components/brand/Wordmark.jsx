export default function Wordmark({ illustrated = false }) {
  if (!illustrated) {
    return (
      <span className="wordmark" role="img" aria-label="NITO">
        <img src="/assets/brand/logo-text.svg" alt="" width="219" height="84" />
      </span>
    );
  }

  return (
    <span
      className="relative block aspect-[180/128] w-full max-w-[180px]"
      role="img"
      aria-label="NITO"
    >
      <img
        className="absolute left-1/2 top-1/2 h-auto w-[83.333%] max-w-none -translate-x-1/2 -translate-y-1/2"
        src="/assets/brand/logo-ring.svg"
        alt=""
        width="140"
        height="140"
      />

      <img
        className="absolute left-1/2 top-1/2 h-auto w-[121.667%] max-w-none -translate-x-1/2 -translate-y-1/2"
        src="/assets/brand/logo-text.svg"
        alt=""
        width="219"
        height="84"
      />
    </span>
  );
}
