import { useId } from "react";
import IconButton from "./IconButton";
export default function SubmitInput({
  label,
  submitLabel = "Submit",
  value,
  onChange,
  placeholder,
  type = "text",
  onSubmit,
  disabled = false,
}) {
  const id = useId();
  return (
    <form className="submit-input" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        disabled={disabled}
      />
      <IconButton
        type="submit"
        label={submitLabel}
        variant="blue"
        disabled={disabled}
      >
        ✓
      </IconButton>
    </form>
  );
}
