export default function PlatformIcon({ platform }) {
  if (platform === "windows")
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 0h9v9H0zm11 0h9v9h-9zM0 11h9v9H0zm11 0h9v9h-9z" />
      </svg>
    );
  return (
    <img src={`/assets/icons/${platform}.svg`} alt="" width="21" height="21" />
  );
}
