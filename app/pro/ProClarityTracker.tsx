"use client";

import { useEffect } from "react";
import {
  clarityEvent,
  clarityTag,
} from "@/lib/clarity-client";

export default function ProClarityTracker({
  userState,
}: {
  userState: "admin" | "registered";
}) {
  useEffect(() => {
    clarityTag("user_state", userState);
    clarityTag("funnel_stage", "pro_opened");
    clarityEvent("pro_opened");
  }, [userState]);

  return null;
}