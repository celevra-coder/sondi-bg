const CONSENT_KEY = "sondi_analytics_consent";

function isLocalEnvironment() {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1"
  );
}

function canTrack() {
  if (
    typeof window === "undefined" ||
    isLocalEnvironment()
  ) {
    return false;
  }

  try {
    if (
      window.localStorage.getItem(CONSENT_KEY) !==
      "granted"
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return typeof window.clarity === "function";
}

export function clarityEvent(name: string) {
  if (!canTrack()) {
    return;
  }

  window.clarity?.("event", name);
}

export function clarityTag(
  key: string,
  value: string
) {
  if (!canTrack()) {
    return;
  }

  window.clarity?.("set", key, value);
}