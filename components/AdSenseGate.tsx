"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const SCRIPT_ID = "sondi-adsense-script";
const PUBLISHER = "ca-pub-9282527731238854";

function allowedPath(pathname: string) {
  const publicPages = [
    "/",
    "/explore",
    "/map",
    "/about",
    "/geology",
    "/sources",
    "/legal",
    "/contact",
    "/grupa",
    "/knowledge",
    "/water",
    "/drilling",
    "/services",
  ];

  const publicSections = [
    "/knowledge/",
    "/water/",
    "/drilling/",
    "/services/",
  ];

  return (
    publicPages.includes(pathname) ||
    publicSections.some((prefix) =>
      pathname.startsWith(prefix)
    )
  );
}

export default function AdSenseGate() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    if (
      window.location.hostname !== "www.sondi.bg" &&
      window.location.hostname !== "sondi.bg"
    ) return;

    if (!allowedPath(pathname)) {
      if (loaded.current) {
        window.location.reload();
      }
      return;
    }

    let active = true;
    let revision = 0;
    const supabase = createClient();

    async function checkEligibility() {
      const current = ++revision;

      try {
        const response = await fetch(
          "/api/adsense-eligibility",
          {
            credentials: "same-origin",
            cache: "no-store",
          }
        );

        if (!active || current !== revision) return;

        if (!response.ok) {
          throw new Error("Eligibility unavailable");
        }

        const data = await response.json();

        if (!active || current !== revision) return;

        if (
          data.eligible !== true ||
          !allowedPath(window.location.pathname)
        ) {
          if (loaded.current) window.location.reload();
          return;
        }

        if (document.getElementById(SCRIPT_ID)) {
          loaded.current = true;
          return;
        }

        const script = document.createElement("script");

        script.id = SCRIPT_ID;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
          PUBLISHER;

        loaded.current = true;
        document.head.appendChild(script);

      } catch {
        if (
          active &&
          current === revision &&
          loaded.current
        ) {
          window.location.reload();
        }
      }
    }

    void checkEligibility();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        if (active) void checkEligibility();
      }, 0);
    });

    function onFocus() {
      void checkEligibility();
    }

    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };

  }, [pathname]);

  return null;
}