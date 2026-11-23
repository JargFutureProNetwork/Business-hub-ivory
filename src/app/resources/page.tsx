import type { Metadata } from "next";
import { ResourceBrowser } from "@/components/hub/ResourceBrowser";

export const metadata: Metadata = {
  title: "Resources",
  description: "Recommended AI, marketing, design and productivity tools for entrepreneurs.",
};

export default function ResourcesPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Business Hub</p>
      <h1 className="mt-2 font-display font-bold text-3xl sm:text-4xl">Resources</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Tools we recommend for running and marketing a small business: AI assistants, design, video,
        social media, research and automation. Each opens in a new tab.
      </p>
      <ResourceBrowser />
    </main>
  );
}
