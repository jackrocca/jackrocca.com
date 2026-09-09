import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentPage } from "@/components/ui-library/component-page";
import { getUIEntry, uiCatalog } from "@/lib/ui-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return uiCatalog.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getUIEntry(slug);
  if (!entry) return { title: "Not found" };
  return { title: entry.title, description: entry.description };
}

export default async function UIComponentRoute({ params }: Props) {
  const { slug } = await params;
  const entry = getUIEntry(slug);
  if (!entry) notFound();
  return <ComponentPage entry={entry} />;
}
