"use client";

import { useEffect, useState } from "react";

const CLARITY_ID = "ye4vsbb4fe";
const STORAGE_KEY = "sondi_analytics_consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

function loadClarity() {
  if (document.getElementById("sondi-clarity-script")) {
    return;
  }

  window.clarity =
    window.clarity ||
    function (...args: unknown[]) {
      const fn = window.clarity as
        | ((...values: unknown[]) => void)
        | undefined;

      const queueHost = fn as
        | (((...values: unknown[]) => void) & {
            q?: unknown[][];
          })
        | undefined;

      if (queueHost) {
        queueHost.q = queueHost.q || [];
        queueHost.q.push(args);
      }
    };

  const script = document.createElement("script");
  script.id = "sondi-clarity-script";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;

  document.head.appendChild(script);
}

export default function AnalyticsConsent() {
  const [choice, setChoice] =
    useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    const stored =
      window.localStorage.getItem(STORAGE_KEY);

    if (
      stored === "granted" ||
      stored === "denied"
    ) {
      setChoice(stored);

      if (stored === "granted") {
        loadClarity();
      }
    }
  }, []);

  function saveChoice(
    value: "granted" | "denied"
  ) {
    window.localStorage.setItem(
      STORAGE_KEY,
      value
    );

    setChoice(value);

    if (value === "granted") {
      loadClarity();

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: value,
        })
      );
    }
  }

  if (choice !== null) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#cfe0e3] bg-white p-5 shadow-[0_18px_60px_rgba(13,50,60,.22)] sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <div className="text-sm font-bold text-[#173f48]">
            {"\u0411\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0438 \u0430\u043d\u0430\u043b\u0438\u0437"}
          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#617a81]">
            {"SONDI.BG \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438 \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u0438. \u0421 \u0432\u0430\u0448\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 Microsoft Clarity, \u0437\u0430 \u0434\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043c\u0435 \u043a\u0430\u043a \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0441\u0430\u0439\u0442\u044a\u0442 \u0438 \u0434\u0430 \u0433\u043e \u043f\u043e\u0434\u043e\u0431\u0440\u044f\u0432\u0430\u043c\u0435."}
            {" "}
            <a
              href="/cookies"
              className="font-semibold text-[#177f98] underline"
            >
              {"\u041d\u0430\u0443\u0447\u0435\u0442\u0435 \u043f\u043e\u0432\u0435\u0447\u0435"}
            </a>
          </p>
        </div>

        <div className="mt-4 flex shrink-0 flex-col gap-2 sm:mt-0 sm:flex-row">
          <button
            type="button"
            onClick={() => saveChoice("denied")}
            className="rounded-xl border border-[#bfd3d7] bg-white px-4 py-2.5 text-xs font-bold text-[#365d66]"
          >
            {"\u0421\u0430\u043c\u043e \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438"}
          </button>

          <button
            type="button"
            onClick={() => saveChoice("granted")}
            className="rounded-xl bg-[#173f48] px-4 py-2.5 text-xs font-bold text-white"
          >
            {"\u041f\u0440\u0438\u0435\u043c\u0430\u043c \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u043d\u0438"}
          </button>
        </div>
      </div>
    </div>
  );
}
