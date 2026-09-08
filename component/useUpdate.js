import { useCallback, useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

// Central place for everything update-related: the running build's own
// commit (baked in at build time via the app's own Vite `define`, see
// README), the waiting update's commit (fetched fresh from build-info.json
// once a new service worker is detected), and the dismissal flag so
// choosing "stay on current build" doesn't re-nag for that same waiting
// build.
//
// `appId` namespaces the localStorage dismissal key — pass the app's own
// short name (e.g. "edoc", "elogbook") so multiple ClaudeBorne apps sharing
// this hook never collide. `pollIntervalMs` (default 60s) controls how often
// the app checks for a new service worker while it stays open — raise it for
// apps that only need to catch up occasionally.
export function useUpdate(appId, pollIntervalMs = 60_000) {
  const current = { commit: __COMMIT_SHA__, version: __COMMIT_SHA__.slice(0, 7) };
  const dismissedKey = `${appId}-update-dismissed-commit`;

  const intervalRef = useRef(null);
  const visibilityHandlerRef = useRef(null);
  const [latest, setLatest] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateChecked, setUpdateChecked] = useState(false);
  const [dismissedCommit, setDismissedCommit] = useState(() =>
    localStorage.getItem(dismissedKey),
  );

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = async () => {
        if (registration.installing) return;
        if (!navigator.onLine) return;
        await registration.update();
      };
      intervalRef.current = setInterval(check, pollIntervalMs);
      visibilityHandlerRef.current = () => {
        if (document.visibilityState === "visible") check();
      };
      document.addEventListener("visibilitychange", visibilityHandlerRef.current);
    },
  });

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (visibilityHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!needRefresh) return;
    fetch(`/build-info.json?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setLatest)
      .catch(() => {});
  }, [needRefresh]);

  const checkForUpdate = useCallback(async () => {
    if (!navigator.onLine) return;
    setCheckingUpdate(true);
    setUpdateChecked(false);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      await registration?.update();
    } catch (e) {
      console.error("SW update check failed:", e);
    }
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateChecked(true);
      setTimeout(() => setUpdateChecked(false), 4000);
    }, 1000);
  }, []);

  const dismissLatest = useCallback(() => {
    if (!latest) return;
    localStorage.setItem(dismissedKey, latest.commit);
    setDismissedCommit(latest.commit);
  }, [latest, dismissedKey]);

  return {
    current,
    latest,
    needRefresh,
    // Fail open: while the latest commit is still unknown (fetch pending or
    // offline), treat it as not dismissed rather than hiding the update.
    promptVisible: needRefresh && (!latest || latest.commit !== dismissedCommit),
    updateServiceWorker,
    checkForUpdate,
    checkingUpdate,
    updateChecked,
    dismissLatest,
  };
}
