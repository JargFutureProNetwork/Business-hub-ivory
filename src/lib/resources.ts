/**
 * Links shown on the Resources page.
 *
 * To add a link, append an entry to `RESOURCES`. Entries are grouped on the
 * page by `category` in the order the categories first appear. `description`
 * is optional.
 *
 * Example:
 *   {
 *     title: "Business registration guide",
 *     url: "https://example.com/registration",
 *     description: "Step-by-step guide to registering a company.",
 *     category: "Getting started",
 *   },
 */
export type Resource = {
  title: string;
  url: string;
  description?: string;
  category: string;
};

export const RESOURCES: Resource[] = [];

/** Groups resources by category, keeping first-seen category order. */
export function groupResources(list: Resource[]): [string, Resource[]][] {
  const groups = new Map<string, Resource[]>();
  for (const r of list) {
    const key = r.category.trim() || "General";
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()];
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
