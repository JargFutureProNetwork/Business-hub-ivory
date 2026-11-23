import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/hub/SiteHeader";
import { SiteFooter } from "@/components/hub/SiteFooter";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ivory Center Business Hub",
    template: "%s · Ivory Center Business Hub",
  },
  description:
    "Interactive business tools from Ivory Center and the Utah-Moldova Business Partnership: Business Model Canvas, Price Builder, UVP & Copy Workbench, and curated resources.",
};

/** Applies the saved theme before first paint so dark mode doesn't flash. */
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('umbp-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The bootstrap script below sets data-theme before React hydrates, so the
    // server markup deliberately differs from the client's on this one element.
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
