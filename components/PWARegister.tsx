"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // PWA registration should never block the app.
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
