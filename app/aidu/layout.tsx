import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AIDU анализ на подземни води",
  description: "Инструменти и анализи за интерпретация на AIDU измервания, геофизични данни и перспективни точки за подземни води.",
  alternates: {
    canonical: "/aidu",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}