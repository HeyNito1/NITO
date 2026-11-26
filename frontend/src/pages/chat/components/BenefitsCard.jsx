import { useId, useState } from "react";

const benefits = [
  "More Chats",
  "More Images",
  "Add Skills",
  "NITO Browser (in app)",
  "Ads Support",
];

export default function BenefitsCard() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="rounded-[11.111px] border-[0.556px] border-[#ffffff80]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[15px] text-left text-[16.667px] leading-[22px]"
      >
        Benefits
        <span
          aria-hidden="true"
          className={`h-[7px] w-[7px] border-b border-r border-current transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            open ? "rotate-[225deg]" : "rotate-45"
          }`}
        />
      </button>

      {/* Height animates 0fr -> 1fr, so everything below slides down smoothly */}
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {/* Content fades in slightly after the box starts opening */}
          <div
            className={`px-[15px] pb-[8px] transition-[opacity,transform,filter] duration-[350ms] ease-out motion-reduce:transition-none ${
              open
                ? "translate-y-0 opacity-100 blur-0 delay-[120ms]"
                : "-translate-y-[6px] opacity-0 blur-[3px]"
            }`}
          >
            <ul className="grid gap-[1px] pb-[8px] pt-[2px]">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-[14px] text-[15px] leading-[21px] text-[var(--nito-muted)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 text-[var(--nito-text)]"
                  >
                    <path
                      d="m2.5 7.4 3 3 6-6.4"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="flex h-[32px] w-full items-center justify-center gap-[6px] rounded-[8px] bg-[var(--nito-text)] text-[var(--nito-input)]"
            >
              <s className="text-[12px] opacity-70">₹ 3,999</s>
              <span className="text-[17px] font-normal">
                ₹ 999/Year
              </span>
            </button>

            <p className="mt-[4px] flex items-center justify-center gap-[4px] text-[11px] text-[var(--nito-muted)]">
              Other Plans <span aria-hidden="true">→</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}