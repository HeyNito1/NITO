import { useSyncExternalStore } from "react";

const KEY = "nito.settings.v1";
export const defaultAppearance = {
  theme: "obsidian",
  mode: "dark",
  size: "medium",
  interfaceFont: "sans",
  responseFont: "sans",
  motion: "system",
};
const defaults = {
  profile: {
    name: "User",
    username: "user",
    email: "",
    phone: "",
    dob: "",
    profession: "",
    organization: "",
    language: "English (US)",
    bio: "",
    avatar: "",
    instructions: "",
    resume: null,
  },
  appearance: defaultAppearance,
  notifications: {
    finished: false,
    payables: false,
    usage: false,
    releases: true,
    tips: true,
    events: true,
    campaigns: true,
    emailPayables: true,
  },
  privacy: {
    showAdPreview: true,
    location: false,
    training: false,
    analytics: false,
    personalization: false,
    advertising: false,
  },
  linkedPlatforms: {},
  billing: {
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    pin: "",
    state: "",
    country: "",
  },
  paymentMethods: [],
  family: [],
  activeFamilyId: "",
  skills: ["general", "research", "writing", "api-platform", "creatives"],
  adDraft: { url: "", headline: "", description: "" },
};
const listeners = new Set();
function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!value || typeof value !== "object") return structuredClone(defaults);
    const next = structuredClone(defaults);
    for (const key of Object.keys(defaults)) {
      if (Array.isArray(defaults[key])) {
        if (Array.isArray(value[key])) next[key] = value[key];
      } else if (defaults[key] && typeof defaults[key] === "object") {
        if (
          value[key] &&
          typeof value[key] === "object" &&
          !Array.isArray(value[key])
        )
          next[key] = { ...defaults[key], ...value[key] };
      } else if (typeof value[key] === typeof defaults[key])
        next[key] = value[key];
    }
    for (const section of [
      "profile",
      "billing",
      "adDraft",
      "notifications",
      "privacy",
    ]) {
      for (const [key, fallback] of Object.entries(defaults[section])) {
        if (fallback !== null && typeof next[section][key] !== typeof fallback)
          next[section][key] = fallback;
      }
    }
    const choices = {
      theme: ["obsidian", "crimson", "midnight", "arctic"],
      mode: ["dark", "light", "system"],
      size: ["small", "medium", "large"],
      interfaceFont: ["sans", "serif", "mono"],
      responseFont: ["sans", "serif", "mono"],
      motion: ["system", "reduce", "full"],
    };
    for (const [key, allowed] of Object.entries(choices))
      if (!allowed.includes(next.appearance[key]))
        next.appearance[key] = defaultAppearance[key];
    next.skills = next.skills.filter((key) => defaults.skills.includes(key));
    next.family = next.family
      .filter(
        (item) =>
          item && typeof item.id === "string" && typeof item.name === "string",
      )
      .map((item) => ({
        ...item,
        dailyLimit: Math.min(500, Math.max(1, Number(item.dailyLimit) || 20)),
        blocked: Array.isArray(item.blocked)
          ? item.blocked.filter((key) => defaults.skills.includes(key))
          : [],
      }));
    if (!next.family.some((item) => item.id === next.activeFamilyId))
      next.activeFamilyId = "";
    next.paymentMethods = next.paymentMethods
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.type === "string" &&
          typeof item.label === "string",
      )
      .map((item) => ({
        ...item,
        last4: /^\d{4}$/.test(item.last4) ? item.last4 : "",
      }));
    next.linkedPlatforms = Object.fromEntries(
      Object.entries(next.linkedPlatforms).filter(
        ([, url]) => typeof url === "string" && /^https?:\/\//i.test(url),
      ),
    );
    if (
      next.profile.avatar &&
      !/^data:image\/(png|jpeg|webp);base64,/i.test(next.profile.avatar)
    )
      next.profile.avatar = "";
    if (
      next.profile.resume &&
      (typeof next.profile.resume.name !== "string" ||
        typeof next.profile.resume.size !== "number")
    )
      next.profile.resume = null;
    return next;
  } catch {
    return structuredClone(defaults);
  }
}
let snapshot = { data: read(), error: "" };
function emit() {
  listeners.forEach((listener) => listener());
}
function save(data) {
  let error = "";
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    error =
      "Your browser could not save these settings. Changes will last until this page is refreshed.";
  }
  snapshot = { data, error };
  emit();
}
export const settingsStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return snapshot;
  },
  update(section, patch) {
    save({
      ...snapshot.data,
      [section]: { ...snapshot.data[section], ...patch },
    });
  },
  set(key, value) {
    save({ ...snapshot.data, [key]: value });
  },
  reset() {
    save(structuredClone(defaults));
  },
};
window.addEventListener("storage", (event) => {
  if (event.key === KEY || event.key === null) {
    snapshot = { data: read(), error: "" };
    emit();
  }
});
export function useSettings() {
  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
  );
}
export function useAppearance() {
  const { data } = useSettings();
  const a = data.appearance;
  return {
    "data-theme":
      a.mode === "light"
        ? "arctic"
        : a.theme === "arctic"
          ? "obsidian"
          : a.theme,
    "data-mode": a.mode,
    "data-size": a.size,
    "data-interface-font": a.interfaceFont,
    "data-response-font": a.responseFont,
    "data-motion": a.motion,
  };
}
