/**
 * Organisation details shown in the site footer.
 *
 * A link with an empty `href` is shown as plain text instead of a dead link.
 * Fill in the URL to make it clickable.
 */
export type SiteLink = { label: string; href: string };

export const ORG = {
  name: "Utah Moldova Business Partnership",
  short: "UMBP",
  addressLines: ["Ivory Center", "Strada Alexandru cel Bun 144", "MD-2004, Chișinău, Moldova"],
  website: { label: "ivorycenter.md", href: "https://ivorycenter.md" },
  email: "utahmoldovapartnership@gmail.com",
  phone: { label: "+1 (801) 258-1590", whatsapp: "https://wa.me/18012581590" },
  founded: "Est. 2015 by Clark Ivory & Walter Plumb III",
};

export const GUIDE: SiteLink[] = [
  { label: "Home", href: "https://ivorycenter.md" },
  { label: "Contact", href: "" },
  { label: "For Interns", href: "" },
];

export const SOCIAL: (SiteLink & { network: "instagram" | "x" | "facebook" | "linkedin" })[] = [
  { network: "instagram", label: "Instagram", href: "" },
  { network: "x", label: "Twitter", href: "" },
  { network: "facebook", label: "Facebook", href: "" },
  { network: "linkedin", label: "LinkedIn", href: "" },
];
