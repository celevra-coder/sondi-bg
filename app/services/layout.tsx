import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Сондажи за вода и кладенци",
  description: "Намери изпълнител за сондаж за вода, публикувай заявка за услуга или представи сондажните си услуги в SONDI.BG.",
  alternates: {
    canonical: "/services",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}