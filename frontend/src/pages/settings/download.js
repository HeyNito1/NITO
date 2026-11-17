export function downloadFile(name, value, type = "application/json") {
  const blob = new Blob(
    [
      typeof value === "string"
        ? value
        : JSON.stringify(
            value,
            (key, item) => (key === "file" ? undefined : item),
            2,
          ),
    ],
    { type },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
