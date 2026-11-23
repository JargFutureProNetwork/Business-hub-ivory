import type { Metadata } from "next";
import { ResourceBrowser } from "@/components/hub/ResourceBrowser";

export const metadata: Metadata = {
  title: "Resources",
  description: "Recommended AI, marketing, design and productivity tools for entrepreneurs.",
};

export default function ResourcesPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <ResourceBrowser />
    </main>
  );
}
