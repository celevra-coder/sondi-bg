export const metadata = {
  title: "Геология и подземни води",
  description: "Геоложка информация за скали, литология, структури, разломи и връзката им с подземните води и сондажите.",
};

import { redirect } from "next/navigation";

export default function GeologyPage() {
  redirect("/map");
}