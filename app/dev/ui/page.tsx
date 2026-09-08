import { notFound } from "next/navigation";
import { UIGallery } from "@/components/ui-gallery";
export const metadata = { title: "UI workshop", robots: { index: false, follow: false } };
export default function UIWorkshop() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <UIGallery />;
}
