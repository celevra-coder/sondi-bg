"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

const WARNING_PATTERN =
  /не замества|не представлява|не е доказателство|не определя|не показва|не потвърждава|не гарантира|не е гарантирана|не са гарантирани|само с теренно|само по реалния|теренно проучване|сондажен разрез|ориентировъч|сравнителен ориентир|не можем надеждно|не е реален вертикален|не описание на реално|за конкретния имот|за конкретен имот|за цялото подземно водно тяло|граници на имоти|лабораторно|определят окончателно|проектни примери|санитарните зони|статичното водно ниво/i;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export default function AnalysisEnhancements() {
  const pathname = usePathname();
  const [warnings, setWarnings] = useState<string[]>([]);

  const isPro = pathname === "/pro";

  const isReport =
    pathname === "/geology/report";

  const enabled = isPro || isReport;

  useEffect(() => {
    if (!enabled) {
      document.body.removeAttribute(
        "data-sondi-analysis-page"
      );

      return;
    }

    document.body.setAttribute(
      "data-sondi-analysis-page",
      isPro ? "pro" : "report"
    );

    const scanWarnings = () => {
      if (!isReport) {
        return;
      }

      const candidates = Array.from(
        document.querySelectorAll(
          "main p, main div"
        )
      ).filter((element) => {
        if (
          element.closest(
            "[data-sondi-warning-summary='true']"
          ) ||
          element.getAttribute(
            "data-sondi-keep-note"
          ) === "true"
        ) {
          return false;
        }

        if (
          element.querySelector(
            "section, article, h1, h2, h3, button, details, table"
          )
        ) {
          return false;
        }

        /*
          Only leaf text notes may be muted.

          Parent layout containers can inherit warning phrases from
          descendant text via textContent. Hiding such a parent would
          remove complete report blocks instead of only the warning.
        */
        if (
          element.tagName === "DIV" &&
          element.querySelector("div, p")
        ) {
          return false;
        }

        const text = normalizeText(
          element.textContent || ""
        );

        const computed = window.getComputedStyle(
          element
        );

        const background = computed.backgroundColor
          .replace(/\s+/g, "");

        const borderColor = computed.borderLeftColor
          .replace(/\s+/g, "");

        const yellowWarning =
          background === "rgb(255,248,230)" ||
          background === "rgb(255,247,230)" ||
          background === "rgb(255,244,229)" ||
          background === "rgb(255,243,205)" ||
          background === "rgb(255,248,225)" ||
          background === "rgb(255,249,230)" ||
          background === "rgb(255,248,220)" ||
          background === "rgb(255,245,220)" ||
          background === "rgb(255,246,222)" ||
          background === "rgb(255,248,231)" ||
          (
            computed.borderLeftWidth !== "0px" &&
            (
              borderColor.includes("255,") ||
              borderColor.includes("234,") ||
              borderColor.includes("245,")
            )
          );

        return (
          text.length >= 35 &&
          text.length <= 950 &&
          (
            WARNING_PATTERN.test(text) ||
            yellowWarning
          )
        );
      });

      const uniqueWarnings: string[] = [];

      candidates.forEach((element, index) => {
        const text = normalizeText(
          element.textContent || ""
        );

        if (!uniqueWarnings.includes(text)) {
          uniqueWarnings.push(text);
        }

        element.setAttribute(
          "data-sondi-muted-note",
          "true"
        );
      });

      setWarnings((previous) => {
        const oldValue = previous.join("\n");

        const newValue =
          uniqueWarnings.join("\n");

        return oldValue === newValue
          ? previous
          : uniqueWarnings;
      });
    };

    const timers = [
      window.setTimeout(scanWarnings, 350),
      window.setTimeout(scanWarnings, 1100),
      window.setTimeout(scanWarnings, 2500),
      window.setTimeout(scanWarnings, 4500),
    ];

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      document.body.removeAttribute(
        "data-sondi-analysis-page"
      );

      document
        .querySelectorAll(
          "[data-sondi-muted-note='true']"
        )
        .forEach((element) => {
          element.removeAttribute(
            "data-sondi-muted-note"
          );
        });
    };
  }, [enabled, isPro, isReport, pathname]);

  if (!enabled) {
    return null;
  }

  const printReport = () => {
    const parameters = new URLSearchParams(
      window.location.search
    );

    const latitude =
      parameters.get("lat") || "точка";

    const longitude =
      parameters.get("lon") ||
      parameters.get("lng") ||
      "";

    const previousTitle = document.title;

    document.title =
      (isPro
        ? "Sondi.bg-PRO-анализ-"
        : "Sondi.bg-сондажен-анализ-") +
      latitude +
      (longitude ? "-" + longitude : "");

    const restoreTitle = () => {
      document.title = previousTitle;

      window.removeEventListener(
        "afterprint",
        restoreTitle
      );
    };

    window.addEventListener(
      "afterprint",
      restoreTitle
    );

    window.print();

    window.setTimeout(
      restoreTitle,
      1800
    );
  };

  const saveToProfile = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const button = event.currentTarget;

    const parameters =
      new URLSearchParams(
        window.location.search
      );

    const analysisId =
      parameters.get("analysis_id")?.trim() || "";

    if (!analysisId) {
      window.alert(
        "\u041b\u0438\u043f\u0441\u0432\u0430 analysis_id \u0437\u0430 \u0442\u043e\u0437\u0438 \u0430\u043d\u0430\u043b\u0438\u0437."
      );
      return;
    }

    const kind =
      isPro ? "expert" : "driller";

    const selector =
      isPro
        ? ".sondi-print-report"
        : ".sondi-drilling-print-report";

    const report =
      document.querySelector(
        selector
      ) as HTMLElement | null;

    if (!report) {
      window.alert(
        "\u041d\u0435 \u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d PDF \u043e\u0442\u0447\u0435\u0442\u044a\u0442."
      );
      return;
    }

    const originalText =
      button.textContent;

    button.disabled = true;
    button.textContent =
      "\u0417\u0430\u043f\u0430\u0437\u0432\u0430\u043d\u0435...";

    try {
      const styles =
        Array.from(
          document.querySelectorAll(
            'style, link[rel="stylesheet"]'
          )
        )
          .map((node) => node.outerHTML)
          .join("\n");

      const reportHtml =
        report.outerHTML;

      const html =
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        '<meta charset="utf-8">' +
        `<base href="${window.location.origin}/">` +
        styles +
        "<style>" +
        "html,body{margin:0!important;padding:0!important;background:#fff!important;}" +
        `${selector}{display:block!important;visibility:visible!important;position:static!important;inset:auto!important;width:100%!important;}` +
        `${selector},${selector} *{visibility:visible!important;}` +
        "</style>" +
        "</head>" +
        "<body>" +
        reportHtml +
        "</body>" +
        "</html>";

      const response =
        await fetch(
          "/api/expert-pdf/render-save",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              analysis_id:
                analysisId,
              kind,
              html,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
          "PDF render failed"
        );
      }

      button.textContent =
        "\u0417\u0430\u043f\u0430\u0437\u0435\u043d\u043e \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u2713";
    } catch (error) {
      console.error(
        "Save analysis PDF error",
        error
      );

      button.disabled = false;
      button.textContent =
        originalText ||
        "\u0417\u0430\u043f\u0430\u0437\u0438 \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0430";

      window.alert(
        "PDF \u0444\u0430\u0439\u043b\u044a\u0442 \u043d\u0435 \u043c\u043e\u0436\u0430 \u0434\u0430 \u0431\u044a\u0434\u0435 \u0437\u0430\u043f\u0430\u0437\u0435\u043d \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0430."
      );
    }
  };

  return (
    <>
      <style>{`
        body[data-sondi-analysis-page="pro"] .sondi-pro-grid {
          align-items: stretch !important;
          grid-auto-rows: minmax(340px, 580px);
        }

        body[data-sondi-analysis-page="pro"] .sondi-pro-card {
          min-width: 0;
          height: 100%;
          max-height: 580px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #b9d6cf transparent;
          overflow-wrap: anywhere;
        }

        body[data-sondi-analysis-page="pro"] .sondi-pro-card h2 {
          line-height: 1.25;
        }

        body[data-sondi-analysis-page="report"] [data-sondi-muted-note="true"] {
          display: none !important;
        }

        .sondi-analysis-toolbar {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 130;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .sondi-analysis-pdf-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-height: 46px;
          padding: 0 19px;
          border: 0;
          border-radius: 999px;
          background: #146c43;
          color: #fff;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 10px 28px rgba(16, 62, 73, .2);
        }

        .sondi-analysis-pdf-button:hover {
          background: #105636;
        }

        .sondi-analysis-limitations {
          width: min(1540px, calc(100vw - 36px));
          margin: 0 auto 28px;
          padding: 11px 14px;
          border: 1px solid #dce8e5;
          border-radius: 14px;
          background: rgba(255, 255, 255, .98);
          color: #42545a;
          box-shadow: 0 8px 26px rgba(16, 62, 73, .12);
        }

        .sondi-analysis-limitations summary {
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .sondi-analysis-limitations-list {
          display: grid;
          gap: 9px;
          margin-top: 10px;
        }

        .sondi-analysis-limitations-item {
          padding-top: 8px;
          border-top: 1px solid #edf2f1;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 760px) {
          body[data-sondi-analysis-page="pro"] .sondi-pro-grid {
            grid-template-columns: 1fr !important;
            grid-auto-rows: auto !important;
          }

          body[data-sondi-analysis-page="pro"] .sondi-pro-card {
            height: auto;
            max-height: none;
            overflow: visible;
          }

          .sondi-analysis-toolbar {
            right: 12px;
            bottom: 12px;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          .sondi-analysis-toolbar,
          body > div > header,
          body > div > nav,
          body > div > footer,
          body > div > button {
            display: none !important;
          }

          html,
          body {
            background: white !important;
          }

          * {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body[data-sondi-analysis-page="pro"] .sondi-pro-grid {
            display: block !important;
          }

          body[data-sondi-analysis-page="pro"] .sondi-pro-card {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin-bottom: 14px !important;
          }

          section,
          article,
          .sondi-pro-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {isReport &&
        warnings.length > 1 &&
        typeof document !== "undefined" &&
        document.querySelector("main") &&
        createPortal(
          <details
            className="sondi-analysis-limitations"
            data-sondi-warning-summary="true"
          >
            <summary>
              Ограничения на анализа ({warnings.length})
            </summary>

            <div className="sondi-analysis-limitations-list">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="sondi-analysis-limitations-item"
                >
                  {warning}
                </div>
              ))}
            </div>
          </details>,
          document.querySelector("main") as Element
        )}

      <aside key={pathname} className="sondi-analysis-toolbar">
        <button
          type="button"
          className="sondi-analysis-pdf-button"
          onClick={printReport}
        >
          <span aria-hidden="true">↓</span>
          Свали PDF
        </button>
        <button
          type="button"
          className="sondi-analysis-pdf-button"
          onClick={saveToProfile}
          style={{
            background: "#14596a",
          }}
        >
          <span aria-hidden="true">♡</span>
          {"\u0417\u0430\u043f\u0430\u0437\u0438 \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0430"}
        </button>
      </aside>
    </>
  );
}