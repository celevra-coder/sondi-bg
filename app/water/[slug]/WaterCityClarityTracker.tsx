"use client";

import { useEffect } from "react";
import {
  clarityEvent,
  clarityTag,
} from "@/lib/clarity-client";

export default function WaterCityClarityTracker({
  settlement,
}: {
  settlement: string;
}) {
  useEffect(() => {
    clarityTag("entry_type", "water_city");
    clarityTag("settlement", settlement);
    clarityTag("funnel_stage", "water_city_page");

    clarityEvent("water_city_page_opened");

    const handleClick = (event: MouseEvent) => {
      const element =
        event.target instanceof Element
          ? event.target.closest('a[href^="/map?"]')
          : null;

      if (!element) {
        return;
      }

      clarityTag(
        "funnel_stage",
        "water_city_map_clicked",
      );

      clarityEvent("water_city_map_clicked");
    };

    document.addEventListener(
      "click",
      handleClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true,
      );
    };
  }, [settlement]);

  return null;
}