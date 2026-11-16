import { useEffect, useRef, useState } from "react";
import { useNotice } from "@/context/NoticeContext";

const items = [
  "Your Profile",
  "Settings",
  "Get Help",
  "Download Desktop App",
  "Upgrade Plan",
];

export default function ProfileMenu({ children }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const rootRef = useRef(null);
  const innerRef = useRef(null);
  const buttonRef = useRef(null);
  const { notify } = useNotice();

  useEffect(() => {
    if (innerRef.current) {
      setHeight(innerRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(label) {
    setOpen(false);
    notify(`${label} is coming soon.`);
  }

  return (
    <div
      ref={rootRef}
      className="chat-sidebar-profile relative"
    >
      {/* Grows upward from the top edge of the profile row */}
      <div
        id="chat-profile-menu"
        role="menu"
        aria-label="Account menu"
        inert={!open}
        style={{ height: open ? height : 0 }}
        className={`absolute -left-[18px] -right-[14px] bottom-full z-20 overflow-hidden rounded-t-[22px] bg-black transition-[height,opacity,visibility] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0 [transition-delay:0ms,0ms,380ms]"
        }`}
      >
        <div ref={innerRef} className="pb-[2px] pt-[8px]">
          {items.map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => choose(label)}
              className="block h-[37px] w-full cursor-pointer px-[18px] text-left text-[16.667px] leading-[37px] text-white hover:bg-white/5"
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => choose("Logout")}
            className="block h-[37px] w-full cursor-pointer px-[18px] text-left text-[16.667px] leading-[37px] text-[#ff1a1a] hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Invisible button covering the whole bottom-left row */}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="chat-profile-menu"
        onClick={() => setOpen((value) => !value)}
        className="absolute inset-y-0 -left-[18px] -right-[14px] cursor-pointer transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04]"
      />

      {/* Row content sits above the button but lets clicks fall through */}
      <div className="pointer-events-none relative flex w-full items-center gap-[10px]">
        {children}

        <span className="chat-settings-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9.5 3-.6 2.3-1.7 1-2.3-.6-2 3.5 1.7 1.7v2.2l-1.7 1.7 2 3.5 2.3-.6 1.7 1 .6 2.3h4.1l.6-2.3 1.7-1 2.3.6 2-3.5-1.7-1.7v-2.2l1.7-1.7-2-3.5-2.3.6-1.7-1-.6-2.3z" stroke="currentColor" strokeWidth="1.5" /><circle cx="11.55" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
      </div>
    </div>
  );
}